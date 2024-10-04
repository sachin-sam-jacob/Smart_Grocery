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

                    {/* Conditionally display the reason if the user is blocked */}
                    {user.isBlocked && user.reason && (
                        <p><strong>Block Reason:</strong> {user.reason}</p>
                    )}
                    
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
            ) : (
                <div>No user details found</div>
            )}
        </div>
    );
};

export default UserDetails;
