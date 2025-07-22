// frontend/src/pages/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios'; // For making HTTP requests

// Styled Components for form
const FormContainer = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2.2rem;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { username, email, password, confirmPassword } = formData;

    const navigate = useNavigate();

    // Check if user is already logged in (e.g., from localStorage)
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            navigate('/'); // If logged in, redirect to dashboard
        }
    }, [navigate]); // navigate is a dependency of useEffect

    // Handle form input changes
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            // API call to backend register endpoint
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios.post(
                'http://localhost:5001/api/auth/register', // Our backend register endpoint
                { username, email, password },
                config
            );

            // If registration is successful
            if (response.data) {
                toast.success('Registration successful! You are now logged in.');
                // Store user info (including token) in local storage
                localStorage.setItem('userInfo', JSON.stringify(response.data));
                navigate('/'); // Redirect to dashboard
            }
        } catch (error) {
            // Handle errors from the backend
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            toast.error(message);
        }
    };

    return (
        <FormContainer>
            <FormTitle>Register</FormTitle>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter password"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        placeholder="Confirm password"
                        required
                    />
                </div>
                <div className="form-group">
                    <Button type="submit">Register</Button>
                </div>
            </form>
        </FormContainer>
    );
}

export default Register;