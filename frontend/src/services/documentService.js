// frontend/src/services/documentService.js
import api from './api';

// Get all documents for the user
const getDocuments = () => {
  return api.get('documents');
};

// Upload a new document
const uploadDocument = (formData) => {
  return api.post('documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete a document by ID
const deleteDocument = (documentId) => {
  return api.delete(`documents/${documentId}`);
};

// Ask a question about a document
const askQuestion = (documentId, question) => {
  return api.post(`documents/${documentId}/ask`, { question });
};

const documentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  askQuestion,
};

export default documentService;