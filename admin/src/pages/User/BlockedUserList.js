import React, { useContext, useEffect, useState } from 'react';
import { fetchDataFromApi, postData, updateData } from '../../utils/api'; // API utility function for fetching and posting data
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import Swal from 'sweetalert2'; // Import SweetAlert2

const BlockedUserList = () => {
    const [userList, setUserList] = useState([]); // Initialize userList as an empty array
    const [loading, setLoading] = useState(true);
    const context = useContext(MyContext);

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const loadBlockedUsers = () => {
        window.scrollTo(0, 0);
        context.setProgress(20);
        fetchDataFromApi('/api/blocked')
            .then((res) => {
                setUserList(res.users);
                context.setProgress(100);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading blocked users:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load blocked users. Please try again.',
                    confirmButtonColor: '#d33'
                });
                setLoading(false);
            });
    };

    // Function to unblock a user with confirmation
    const unblockUser = (userId, userName) => {
        Swal.fire({
            title: 'Confirm Unblock',
            text: `Are you sure you want to unblock ${userName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, unblock!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(true);
                updateData(`/api/blocked/unblock/${userId}`, {})
                    .then((res) => {
                        if (!res.error) {
                            // Update the userList to remove the unblocked user
                            setUserList(userList.filter(user => user._id !== userId));
                            
                            // Show success message
                            Swal.fire({
                                icon: 'success',
                                title: 'Unblocked!',
                                text: `${userName} has been unblocked successfully.`,
                                showConfirmButton: false,
                                timer: 1500
                            });
                        } else {
                            throw new Error(res.msg || 'Failed to unblock user');
                        }
                    })
                    .catch((error) => {
                        console.error("Error unblocking user:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to unblock user. Please try again.',
                            confirmButtonColor: '#d33'
                        });
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        });
    };

    return (
        <div className="card shadow border-0 p-4 mt-4">
            <h5 className="mb-4">Blocked Users</h5>
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
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
                                                onClick={() => unblockUser(user._id, user.name)} 
                                                className="btn btn-success btn-sm"
                                                disabled={loading}
                                            >
                                                {loading ? 'Processing...' : 'Unblock'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        <div className="p-3">
                                            <i className="fas fa-users-slash fa-2x mb-3 text-muted"></i>
                                            <p className="mb-0">No blocked users found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Link to="/user/list">
                <button 
                    type="button" 
                    className="btn btn-primary mt-3"
                >
                    BACK TO USER LIST
                </button>
            </Link>
        </div>
    );
};

export default BlockedUserList;
