// frontend/src/components/DocumentItem.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import documentService from '../services/documentService';

// Styled components specific to the DocumentItem
const ItemContainer = styled.article`
    background-color: var(--charcoal);
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
`;

const Thumbnail = styled.div`
    width: 100%;
    height: 150px;
    background-color: var(--jet);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: var(--gray);
`;

const ItemContent = styled.div`
    padding: 15px;
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
    color: #fff;
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
    background-color: var(--jet);
    color: var(--light-gray);
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
        background-color: #383838;
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
        background-color: #b20710;
    }
`;

const DetailsContainer = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    width: 100%;
`;

const SectionTitle = styled.h4`
    color: var(--light-gray);
    margin-bottom: 8px;
    font-size: 1em;
`;

const ContentBox = styled.div`
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid var(--jet);
    padding: 15px;
    background-color: var(--black);
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
    padding: 8px;
    border: 1px solid var(--jet);
    border-radius: 5px;
    font-size: 0.9em;
    min-width: 200px; /* Ensure input doesn't get too small */
`;

const AskButton = styled.button`
    background-color: #28a745; /* Green color for Ask */
    color: #fff;
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
    background-color: #1f2c33; /* Dark blue for answer */
    border-color: var(--blue);
`;


// DocumentItem Functional Component
function DocumentItem({ document, onDelete }) {
  const [showDetails, setShowDetails] = useState(false); // For extracted text and summary
  const [showQA, setShowQA] = useState(false); // For Q&A section
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState(null);

  const handleAskQuestion = async (e) => {
      e.preventDefault();
      if (!question.trim()) {
          toast.error('Please enter a question.');
          return;
      }

      setQaLoading(true);
      setQaError(null);
      setAnswer(''); // Clear previous answer

      try {
          const response = await documentService.askQuestion(document._id, question);
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
      <Thumbnail>📄</Thumbnail>
      <ItemContent>
        <ItemHeader>
          <ItemInfo>
            <ItemName>{document.fileName}</ItemName>
            <ItemMeta>
              {(document.fileSize / 1024 / 1024).toFixed(2)} MB | {new Date(document.createdAt).toLocaleDateString()}
            </ItemMeta>
          </ItemInfo>
          <ButtonGroup>
            <ToggleDetailsButton onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide' : 'Details'}
            </ToggleDetailsButton>
            <ToggleDetailsButton onClick={() => setShowQA(!showQA)}>
              {showQA ? 'Hide' : 'Q&A'}
            </ToggleDetailsButton>
            <DeleteButton onClick={() => onDelete(document._id)}>Delete</DeleteButton>
          </ButtonGroup>
        </ItemHeader>

        {/* AI Details Section */}
        {showDetails && (
          <DetailsContainer>
            <SectionTitle>AI Summary:</SectionTitle>
            <ContentBox>
              <p>{document.summary || 'No summary available.'}</p>
            </ContentBox>
            <SectionTitle>Extracted Text:</SectionTitle>
            <ContentBox>
              <p>{document.extractedText || 'No extracted text available.'}</p>
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
                        placeholder="Type your question..."
                        disabled={qaLoading}
                    />
                    <AskButton type="submit" disabled={qaLoading}>
                        {qaLoading ? '...' : 'Ask'}
                    </AskButton>
                </QAForm>

                {answer && (
                    <AnswerBox>
                        <p>{answer}</p>
                    </AnswerBox>
                )}

                {qaError && <p style={{ color: 'var(--red)', marginTop: '10px' }}>Error: {qaError}</p>}
            </QAContainer>
        )}
      </ItemContent>
    </ItemContainer>
  );
}

export default DocumentItem;