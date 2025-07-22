// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Import the new DocumentItem component
import DocumentItem from '../components/DocumentItem'; // <--- THIS IS CRUCIAL

// Styled components (ONLY these general layout components remain in Dashboard.js)
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 20px auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
`;

const Button = styled.button`
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: #0056b3;
    }
`;

const DocumentList = styled.div`
    margin-top: 20px;
`;


function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:5001/api/documents';

    useEffect(() => {
        if (!user) {
            navigate('/login');
            toast.warn('Please log in to view the dashboard.');
        } else {
            fetchDocuments();
        }
    }, [user, navigate]);

    const fetchDocuments = async () => {
        if (!user || !user.token) return;

        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.get(API_URL, config);
            setDocuments(response.data);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setError(err.response?.data?.message || 'Failed to load documents.');
            toast.error('Failed to load documents.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Please select a file to upload.');
            return;
        }

        if (!user || !user.token) {
            toast.error('You must be logged in to upload files.');
            navigate('/login');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.post(API_URL, formData, config);
            toast.success(response.data.message || 'File uploaded successfully!');
            setSelectedFile(null);
            fetchDocuments();
        } catch (err) {
            console.error('Upload error:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'File upload failed!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        if (!user || !user.token) {
            toast.error('You must be logged in to delete files.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete(`${API_URL}/${documentId}`, config);
            toast.success('Document deleted successfully!');
            fetchDocuments();
        } catch (err) {
            console.error('Delete error:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to delete document.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardContainer>Loading documents...</DashboardContainer>;
    if (error) return <DashboardContainer>Error: {error}</DashboardContainer>;
    if (!user) return null;

    return (
        <DashboardContainer>
            <h1>Welcome, {user.username}!</h1>
            <p>Upload your documents for AI processing.</p>

            <Form onSubmit={handleUpload}>
                <FormGroup>
                    <Label htmlFor="documentFile">Choose Document:</Label>
                    <Input
                        type="file"
                        id="documentFile"
                        name="document"
                        onChange={handleFileChange}
                        accept=".jpeg,.jpg,.png,.pdf,.doc,.docx,.txt" // Ensure .txt is included
                    />
                </FormGroup>
                <Button type="submit">Upload Document</Button>
            </Form>

            <h2>Your Uploaded Documents</h2>
            {documents.length === 0 ? (
                <p>No documents uploaded yet.</p>
            ) : (
                <DocumentList>
                    {/* Map over documents and render the DocumentItem component for each */}
                    {documents.map((doc) => (
                        <DocumentItem key={doc._id} document={doc} onDelete={handleDelete} />
                    ))}
                </DocumentList>
            )}
        </DashboardContainer>
    );
}

export default Dashboard;