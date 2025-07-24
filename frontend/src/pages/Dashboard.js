// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Import the new DocumentItem component
import DocumentItem from '../components/DocumentItem'; // <--- THIS IS CRUCIAL
import documentService from '../services/documentService';

// Styled components (ONLY these general layout components remain in Dashboard.js)
import styled from 'styled-components';

const DashboardContainer = styled.div`
    padding: 40px 20px;
    max-width: 1200px;
    margin: 20px auto;
    width: 100%;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid var(--jet);
    border-radius: 8px;
    background-color: var(--charcoal);
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 5px;
    font-weight: bold;
    color: var(--light-gray);
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid var(--jet);
    border-radius: 5px;
    font-size: 1rem;
    background-color: var(--black);
    color: var(--light-gray);

    &::file-selector-button {
        background-color: var(--jet);
        color: var(--light-gray);
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
    }
`;

const Button = styled.button`
    background-color: var(--blue);
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
`;

const DocumentList = styled.div`
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
`;

const LoadingState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 1.2rem;
    color: var(--gray);
    width: 100%;
`;


function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDocuments = useCallback(async () => {
        if (!user || !user.token) return;

        setLoading(true);
        setError(null);
        try {
            const response = await documentService.getDocuments();
            setDocuments(response.data);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setError(err.response?.data?.message || 'Failed to load documents.');
            toast.error('Failed to load documents.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            toast.warn('Please log in to view the dashboard.');
        } else {
            fetchDocuments();
        }
    }, [user, navigate, fetchDocuments]);

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
            const response = await documentService.uploadDocument(formData);
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
            await documentService.deleteDocument(documentId);
            toast.success('Document deleted successfully!');
            fetchDocuments();
        } catch (err) {
            console.error('Delete error:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to delete document.');
        } finally {
            setLoading(false);
        }
    };

    // Only show the full-page loader on the initial fetch
    if (loading && documents.length === 0) return <LoadingState>Loading documents...</LoadingState>;
    if (error) return <LoadingState>Error: {error}</LoadingState>;
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
                <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Document'}</Button>
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