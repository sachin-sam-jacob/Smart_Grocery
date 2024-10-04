import React, { useContext, useEffect, useState } from 'react';
import { fetchDataFromApi, postData, updateData } from '../../utils/api'; // API utility function for fetching and posting data
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const BlockedUserList = () => {
    const [userList, setUserList] = useState([]); // Initialize userList as an empty array
    const [loading, setLoading] = useState(true);
    const context = useContext(MyContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setProgress(20);
        fetchDataFromApi('/api/blocked').then((res) => {
            setUserList(res.users);
            context.setProgress(100);
        });
    }, []);

    // Function to unblock a user
    const unblockUser = (userId) => {
        updateData(`/api/blocked/unblock/${userId}`, {})
            .then((res) => {
                if (!res.error) {
                    // Update the userList to remove the unblocked user
                    setUserList(userList.filter(user => user._id !== userId));
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: "User has been Unblocked successfully!",
                    });
                }
            })
            .catch((error) => {
                console.error("Error unblocking user:", error);
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: "Failed to unblock user. Please try again.",
                });
            });
    };

    return (
        <div className="card shadow border-0 p-4 mt-4">
            <h5 className="mb-4">Blocked Users</h5>
            <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped v-align">
                    <thead className="thead-dark">
                        <tr>
                            <th>USERNAME</th>
                            <th>EMAIL</th>
                            <th>BLOCK REASON</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.length > 0 ? (
                            userList.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.reason || 'No reason provided'}</td>
                                    <td>
                                        <button 
                                            onClick={() => unblockUser(user._id)} 
                                            style={{
                                                backgroundColor: 'green', 
                                                border: 'none', 
                                                color: 'white', 
                                                padding: '5px 10px', 
                                                cursor: 'pointer',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            Unblock
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    No blocked users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Link to="/user/list">
                <button 
                    type="button" 
                    style={{
                        backgroundColor: 'blue', 
                        border: 'none', 
                        color: 'white', 
                        padding: '10px 20px', 
                        textAlign: 'center', 
                        textDecoration: 'none', 
                        display: 'inline-block', 
                        fontSize: '16px', 
                        margin: '10px 0', 
                        cursor: 'pointer', 
                        borderRadius: '4px'
                    }}
                >
                    BACK
                </button>
            </Link>
        </div>
    );
};

export default BlockedUserList;
