import React, { useState, useEffect, useContext } from 'react';
import { fetchDataFromApi, updateData, deleteData } from '../../utils/api';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem } from '@mui/material';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";
import { MyContext } from '../../App';
import Swal from 'sweetalert2';

// Breadcrumb styling
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
    },
}));

const ManageStockManagers = () => {
    const [stockManagers, setStockManagers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");
    const context = useContext(MyContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setProgress(20);
        fetchStockManagers();
    }, []);

    const fetchStockManagers = async () => {
        try {
            const data = await fetchDataFromApi('/api/stockManagers');
            setStockManagers(data);
            context.setProgress(100);
        } catch (error) {
            console.error('Error fetching stock managers:', error);
            context.setProgress(100);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const isActive = newStatus === 'active';
            await updateData(`/api/stockManagers/status/${id}`, { isActive });
            fetchStockManagers();
            context.setAlertBox({
                open: true,
                error: false,
                msg: `Stock Manager status updated to ${newStatus} successfully!`,
            });
        } catch (error) {
            console.error('Error updating stock manager status:', error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Error updating stock manager status.",
            });
        }
    };

    const handleOpenDialog = (manager) => {
        setSelectedManager(manager);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDeleteReason("");
    };

    const handleDelete = async () => {
        if (deleteReason.trim() === "") {
            Swal.fire("Error", "Please provide a reason for deleting the stock manager.", "error");
            return;
        }
        try {
            await deleteData(`/api/stockManagers/${selectedManager._id}`, { reason: deleteReason });
            fetchStockManagers();
            handleCloseDialog();
            context.setAlertBox({
                open: true,
                error: false,
                msg: "Stock Manager deleted successfully!",
            });
        } catch (error) {
            console.error('Error deleting stock manager:', error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Error deleting stock manager.",
            });
        }
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">Manage Stock Managers</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />
                            <StyledBreadcrumb
                                label="Manage Stock Managers"
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
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>LOCATION</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockManagers.length > 0 ? (
                                    stockManagers.map((manager) => (
                                        <tr key={manager._id}>
                                            <td>{manager.name}</td>
                                            <td>{manager.email}</td>
                                            <td>{manager.location}</td>
                                            <td>
                                                <Select
                                                    value={manager.isStockManager ? 'active' : 'inactive'}
                                                    onChange={(e) => handleStatusChange(manager._id, e.target.value)}
                                                    size="small"
                                                >
                                                    <MenuItem value="active">Active</MenuItem>
                                                    <MenuItem value="inactive">Inactive</MenuItem>
                                                </Select>
                                            </td>
                                            <td>
                                                <div className="actions d-flex align-items-center">
                                                    <Link to={`/stockManager/view/${manager._id}`}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            style={{
                                                                textTransform: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '5px 30px',
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>
                                            No stock managers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Stock Manager Reason Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Delete Stock Manager</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Deleting"
                        type="text"
                        fullWidth
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManageStockManagers;
