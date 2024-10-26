import React, { useState, useEffect, useContext } from 'react';
import { fetchDataFromApi } from '../../utils/api';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography, 
    Box, 
    Button,
    Chip,
    useTheme
} from '@mui/material';
import { MyContext } from '../../App';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";

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

const ListStockManagers = () => {
    const [stockManagers, setStockManagers] = useState([]);
    const context = useContext(MyContext);
    const theme = useTheme();

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

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Stock Managers List</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Stock Managers List"
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
                                            <Chip 
                                                label={manager.isStockManager ? 'Active' : 'Inactive'} 
                                                color={manager.isStockManager ? 'success' : 'error'}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '12px',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                }}
                                            />
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
    );
};

export default ListStockManagers;
