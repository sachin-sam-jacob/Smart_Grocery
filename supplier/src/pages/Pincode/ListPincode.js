import React, { useState, useEffect } from 'react';
import { deleteData, postData, fetchDataFromApi } from '../../utils/api';
import { 
    IconButton, Typography, Box, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, TextField, CircularProgress, Chip, useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

const ListPincode = () => {
    const [district, setDistrict] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingPincode, setEditingPincode] = useState({ code: '', place: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const token = localStorage.getItem('user');
        if (token) {
            const userData = JSON.parse(token);
            fetchDistrict(userData.location);
        }
    }, []);

    const fetchDistrict = async (districtName) => {
        try {
            setLoading(true);
            const response = await fetchDataFromApi(`/api/pincodes/list/${districtName}`);
            console.log(response);
            setDistrict(response);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching district:', error);
            setError('Failed to fetch district data');
            setLoading(false);
            Swal.fire("Error", "Failed to fetch district data", "error");
        }
    };

    const handleDelete = async (pincode) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete pincode ${pincode}. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await deleteData(`/api/pincodes/${district.name}/${pincode}`);
                Swal.fire(
                    'Deleted!',
                    'The pincode has been deleted.',
                    'success'
                );
                fetchDistrict(district.name);
            }
        } catch (error) {
            console.error('Error deleting pincode:', error);
            Swal.fire(
                'Error',
                'Failed to delete pincode',
                'error'
            );
        }
    };

    const handleEdit = (pincode) => {
        setEditingPincode({
            ...pincode,
            originalCode: pincode.code // Store the original code
        });
        setOpenEditDialog(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await postData(`/api/pincodes/${district.name}/${editingPincode.originalCode}`, { 
                newPincode: editingPincode.code,
                newPlace: editingPincode.place 
            });
            if (response.message) {
                Swal.fire("Success", "Pincode updated successfully", "success");
                setOpenEditDialog(false);
                fetchDistrict(district.name);
            } else {
                Swal.fire("Error", response.message || "Failed to update pincode", "error");
            }
        } catch (error) {
            console.error('Error updating pincode:', error);
            Swal.fire("Error", "Failed to update pincode", "error");
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Pincodes for {district?.name}</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Pincodes List"
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
                                <th>PINCODE</th>
                                <th>PLACE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {district && district.pincodes && district.pincodes.length > 0 ? (
                                district.pincodes.map((pincode, index) => (
                                    <tr key={index}>
                                        <td>{pincode.code}</td>
                                        <td>{pincode.place}</td>
                                        <td>
                                            <IconButton onClick={() => handleEdit(pincode)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(pincode.code)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center' }}>
                                        No pincodes found for this district
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Pincode</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Pincode"
                        type="text"
                        fullWidth
                        value={editingPincode.code}
                        onChange={(e) => setEditingPincode({...editingPincode, code: e.target.value})}
                    />
                    <TextField
                        margin="dense"
                        label="Place"
                        type="text"
                        fullWidth
                        value={editingPincode.place}
                        onChange={(e) => setEditingPincode({...editingPincode, place: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ListPincode;
