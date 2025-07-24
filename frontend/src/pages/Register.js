// frontend/src/pages/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
    FormContainer,
    FormTitle,
    Form,
    FormGroup,
    Input,
    Button,
    FormText,
    FormLink
} from '../components/FormStyles';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { username, email, password, confirmPassword } = formData;

    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Check if user is already logged in (e.g., from localStorage)
    useEffect(() => {
        if (user) {
            navigate('/'); // If logged in, redirect to dashboard
        }
    }, [user, navigate]); // navigate is a dependency of useEffect

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
            const response = await authService.register({ username, email, password });

            // If registration is successful
            if (response.data) {
                toast.success('Registration successful! You are now logged in.');
                // Use the login function from context to set user state and localStorage
                login(response.data);
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
            <Form onSubmit={onSubmit}>
                <FormGroup>
                    <Input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        placeholder="Username"
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Email address"
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        placeholder="Password"
                        onChange={onChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        placeholder="Confirm password"
                        required
                    />
                </FormGroup>
                <Button type="submit">Register</Button>
            </Form>
            <FormText>
                Already have an account? <FormLink to="/login">Sign in.</FormLink>
            </FormText>
        </FormContainer>
    );
}

export default Register;