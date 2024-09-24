import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api'; // Your API utility function
import { Link } from "react-router-dom";

const UserDetails = () => {
    const { id } = useParams(); // Get the user id from the route parameters
    const [user, setUser] = useState(null); // State to store user details
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchDataFromApi(`/api/listusers/${id}`); // Fetch user details by id
                setUser(data);
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        getUserDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card shadow border-0 p-4 mt-4">
            <h5 className="mb-4">User Details</h5>
            {user ? (
                <div>
                    <p><strong>Username:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Status:</strong> {user.isBlocked ? 'Blocked' : 'Active'}</p>
                    <Link to="/user/list"> <button 
                            type="button" 
                            style={{
                                backgroundColor: 'blue', 
                                border: 'none', // Remove border
                                color: 'white', // White text
                                padding: '10px 20px', // Padding
                                textAlign: 'center', // Center text
                                textDecoration: 'none', // Remove underline
                                display: 'inline-block', // Keep inline
                                fontSize: '16px', // Text size
                                margin: '10px 0', // Margin around button
                                cursor: 'pointer', // Pointer on hover
                                borderRadius: '4px' // Rounded corners
                            }}
                        >
                            BACK
                        </button></Link>
                </div>
            ) : (
                <div>No user details found</div>
            )}
        </div>
    );
};

export default UserDetails;
