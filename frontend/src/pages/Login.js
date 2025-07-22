// frontend/src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // <--- NEW

const API_URL = 'http://localhost:5001/api/auth/login'; // Your existing API URL

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const { user, login: authLogin } = useAuth(); // <--- Use useAuth hook

    // Redirect if already logged in (optional, but good UX)
    useEffect(() => {
        if (user) {
            navigate('/'); // Redirect to dashboard or home if already logged in
        }
    }, [user, navigate]); // Add user to dependency array

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API_URL, formData);
            if (response.data) {
                authLogin(response.data); // <--- Use context login function
                toast.success('Logged in successfully!');
                navigate('/'); // Navigate to dashboard or home
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        // ... (your existing form JSX remains the same)
        <>
            <section className="heading">
                <h1>
                    Login
                </h1>
                <p>Login to get started</p>
            </section>

            <section className="form">
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Enter password"
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-block">
                            Submit
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default Login;