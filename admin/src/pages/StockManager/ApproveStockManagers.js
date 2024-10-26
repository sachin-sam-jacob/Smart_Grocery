import React, { useState, useEffect } from 'react';
import { fetchDataFromApi, updateData } from '../../utils/api';

const ApproveStockManagers = () => {
    const [pendingManagers, setPendingManagers] = useState([]);

    useEffect(() => {
        fetchPendingManagers();
    }, []);

    const fetchPendingManagers = async () => {
        try {
            const data = await fetchDataFromApi('/api/stockManagers/pending');
            setPendingManagers(data);
        } catch (error) {
            console.error('Error fetching pending stock managers:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await updateData(`/api/stockManagers/approve/${id}`, { status: 'active' });
            fetchPendingManagers();
        } catch (error) {
            console.error('Error approving stock manager:', error);
        }
    };

    return (
        <div>
            <h2>Approve Stock Managers</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingManagers.map(manager => (
                        <tr key={manager._id}>
                            <td>{manager.name}</td>
                            <td>{manager.email}</td>
                            <td>
                                <button onClick={() => handleApprove(manager._id)}>Approve</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApproveStockManagers;
