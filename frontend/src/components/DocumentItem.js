// frontend/src/components/DocumentItem.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // Import axios for API calls
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // To get user token

// Styled components specific to the DocumentItem
const ItemContainer = styled.div`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 10px;
`;

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const ItemName = styled.span`
    font-weight: bold;
    color: #333;
    font-size: 1.1em;
`;

const ItemMeta = styled.span`
    font-size: 0.85em;
    color: #666;
    margin-top: 5px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 5px;
    @media (min-width: 768px) {
        margin-top: 0;
    }
`;

const ToggleDetailsButton = styled.button`
    background-color: #6c757d;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
        background-color: #5a6268;
    }
`;

const DeleteButton = styled.button`
    background-color: #dc3545;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
        background-color: #c82333;
    }
`;

const DetailsContainer = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    width: 100%;
`;

const SectionTitle = styled.h4`
    color: #555;
    margin-bottom: 8px;
    font-size: 1em;
`;

const ContentBox = styled.div`
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    padding: 15px;
    background-color: #fdfdfd;
    border-radius: 5px;
    font-size: 0.85em;
    line-height: 1.6;
    margin-bottom: 15px;
    white-space: pre-wrap;
    word-break: break-word;
`;

// New styled components for Q&A section
const QAContainer = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    width: 100%;
`;

const QAForm = styled.form`
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
    flex-wrap: wrap; /* Allow wrapping on small screens */
`;

const QuestionInput = styled.input`
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9em;
    min-width: 200px; /* Ensure input doesn't get too small */
`;

const AskButton = styled.button`
    background-color: #28a745; /* Green color for Ask */
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    &:hover {
        background-color: #218838;
    }
    &:disabled {
        background-color: #90ee90;
        cursor: not-allowed;
    }
`;

const AnswerBox = styled(ContentBox)` /* Reuses ContentBox styles */
    background-color: #e6f7ff; /* Light blue for answer */
    border-color: #99d9ed;
`;


// DocumentItem Functional Component
function DocumentItem({ document, onDelete }) {
  const { user } = useAuth(); // Get user token from AuthContext
  const [showDetails, setShowDetails] = useState(false); // For extracted text and summary
  const [showQA, setShowQA] = useState(false); // For Q&A section
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState(null);

  const API_URL = `http://localhost:5001/api/documents/${document._id}/ask`;

  const handleAskQuestion = async (e) => {
      e.preventDefault();
      if (!question.trim()) {
          toast.error('Please enter a question.');
          return;
      }
      if (!user || !user.token) {
          toast.error('You must be logged in to ask questions.');
          return;
      }

      setQaLoading(true);
      setQaError(null);
      setAnswer(''); // Clear previous answer

      try {
          const config = {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`,
              },
          };
          const response = await axios.post(API_URL, { question }, config);
          setAnswer(response.data.answer);
      } catch (err) {
          console.error('Q&A error:', err.response?.data || err.message);
          setQaError(err.response?.data?.message || 'Failed to get answer from AI.');
          toast.error(err.response?.data?.message || 'Failed to get answer from AI.');
      } finally {
          setQaLoading(false);
      }
  };


  return (
    <ItemContainer>
      <ItemHeader>
        <ItemInfo>
          <ItemName>{document.fileName}</ItemName>
          <ItemMeta>
            Type: {document.fileType} &nbsp;|&nbsp; Size: {(document.fileSize / 1024 / 1024).toFixed(2)} MB &nbsp;|&nbsp; Uploaded: {new Date(document.createdAt).toLocaleDateString()}
          </ItemMeta>
        </ItemInfo>
        <ButtonGroup>
          <ToggleDetailsButton onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </ToggleDetailsButton>
          <ToggleDetailsButton onClick={() => setShowQA(!showQA)}>
            {showQA ? 'Hide Q&A' : 'Show Q&A'} {/* New button for Q&A */}
          </ToggleDetailsButton>
          <DeleteButton onClick={() => onDelete(document._id)}>Delete</DeleteButton>
        </ButtonGroup>
      </ItemHeader>

      {/* AI Details Section */}
      {showDetails && (
        <DetailsContainer>
          <SectionTitle>Extracted Text:</SectionTitle>
          <ContentBox>
            <p>{document.extractedText || 'No extracted text available.'}</p>
          </ContentBox>

          <SectionTitle>AI Summary:</SectionTitle>
          <ContentBox>
            <p>{document.summary || 'No summary available.'}</p>
          </ContentBox>
        </DetailsContainer>
      )}

      {/* NEW: Q&A Section */}
      {showQA && (
          <QAContainer>
              <SectionTitle>Ask a Question:</SectionTitle>
              <QAForm onSubmit={handleAskQuestion}>
                  <QuestionInput
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question about the document..."
                      disabled={qaLoading}
                  />
                  <AskButton type="submit" disabled={qaLoading}>
                      {qaLoading ? 'Asking...' : 'Ask'}
                  </AskButton>
              </QAForm>

              {answer && (
                  <>
                      <SectionTitle>Answer:</SectionTitle>
                      <AnswerBox>
                          <p>{answer}</p>
                      </AnswerBox>
                  </>
              )}

              {qaError && <p style={{ color: 'red', marginTop: '10px' }}>Error: {qaError}</p>}
          </QAContainer>
      )}
    </ItemContainer>
  );
}

export default DocumentItem;