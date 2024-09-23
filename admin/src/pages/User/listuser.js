import React, { useContext, useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { FaEye } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchDataFromApi, updateData } from "../../utils/api";

// Breadcrumb styling
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const UserList = () => {
    const [userList, setUserList] = useState([]);
    const context = useContext(MyContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setProgress(20);
        fetchDataFromApi('/api/users').then((res) => {
            setUserList(res);
            context.setProgress(100);
        });
    }, []);

    const blockUser = (id, isBlocked) => {
        context.setProgress(30);
        updateData(`/api/users/${id}`, { isBlocked: !isBlocked }).then(res => {
            context.setProgress(100);
            fetchDataFromApi('/api/users').then((res) => {
                setUserList(res);
                context.setProgress(100);
                context.setProgress({
                    open: true,
                    error: false,
                    msg: isBlocked ? "User Unblocked!" : "User Blocked!"
                });
            });
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">User List</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />
                            <StyledBreadcrumb
                                label="User List"
                                deleteIcon={<ExpandMoreIcon />}
                            />
                        </Breadcrumbs>
                    </div>
                </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered table-striped v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>USERNAME</th>
                                    <th>EMAIL</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    userList?.length !== 0 && userList?.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {user.isBlocked ? (
                                                    <span style={{ color: 'red' }}>Blocked</span>
                                                ) : (
                                                    <span style={{ color: 'green' }}>Active</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="actions d-flex align-items-center">
                                                    <Link to={`/user/details/${user.id}`}>
                                                        <Button className="success" color="primary">
                                                            <FaEye /> View
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        className="error"
                                                        color={user.isBlocked ? "success" : "error"}
                                                        onClick={() => blockUser(user.id, user.isBlocked)}
                                                    >
                                                        <MdBlock /> {user.isBlocked ? "Unblock" : "Block"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserList;