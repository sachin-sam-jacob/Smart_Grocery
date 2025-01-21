import { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi, updateData } from '../../utils/api';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Switch,
    Button,
    CircularProgress,
    Breadcrumbs,
    Chip
} from '@mui/material';
import { emphasize, styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';

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

const ManageSuppliers = () => {
    const { setAlertBox } = useContext(MyContext);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const district = JSON.parse(localStorage.getItem('user'))?.location || '';

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await fetchDataFromApi(`/api/stockmanager/suppliers/${district}`);
            if (response.success) {
                setSuppliers(response.suppliers);
            } else {
                throw new Error(response.message || 'Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setAlertBox({
                open: true,
                error: true,
                msg: error.message || 'Failed to fetch suppliers'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (supplierId, currentStatus) => {
        try {
            setUpdatingId(supplierId);
            const response = await updateData(`/api/stockmanager/supplier-status/${supplierId}`, {
                isActive: !currentStatus
            });

            if (response.success) {
                setSuppliers(suppliers.map(supplier => 
                    supplier._id === supplierId 
                        ? { ...supplier, isActive: !currentStatus }
                        : supplier
                ));
                setAlertBox({
                    open: true,
                    error: false,
                    msg: `Supplier ${currentStatus ? 'deactivated' : 'activated'} successfully`
                });
            } else {
                throw new Error(response.message || 'Failed to update supplier status');
            }
        } catch (error) {
            console.error('Error updating supplier status:', error);
            setAlertBox({
                open: true,
                error: true,
                msg: error.message || 'Failed to update supplier status'
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const viewSupplierDetails = (supplier) => {
        Swal.fire({
            title: 'Supplier Details',
            html: `
                <div style="text-align: left">
                    <p><strong>Name:</strong> ${supplier.name}</p>
                    <p><strong>Email:</strong> ${supplier.email}</p>
                    <p><strong>Phone:</strong> ${supplier.phone}</p>
                    <p><strong>District:</strong> ${supplier.location}</p>
                    <p><strong>Status:</strong> ${supplier.isActive ? 'Active' : 'Inactive'}</p>
                </div>
            `,
            confirmButtonText: 'Close',
            customClass: {
                container: 'supplier-details-modal'
            }
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Manage Suppliers - {district}</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Manage Suppliers"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>
            </div>

            <div className="card shadow border-0 p-4 mt-4">
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier._id}>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={supplier.isActive}
                                            onChange={() => handleStatusChange(supplier._id, supplier.isActive)}
                                            disabled={updatingId === supplier._id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => viewSupplierDetails(supplier)}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default ManageSuppliers; 