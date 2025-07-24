// frontend/src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // <--- NEW
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
            const response = await authService.login(formData);
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
        <FormContainer>
            <FormTitle>Sign In</FormTitle>
            <Form onSubmit={onSubmit}>
                <FormGroup>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        placeholder="Email address"
                        onChange={onChange}
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
                <Button type="submit">Sign In</Button>
            </Form>
            <FormText>
                New to SmartDoc? <FormLink to="/register">Sign up now.</FormLink>
            </FormText>
        </FormContainer>
    );
}

export default Login;