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
    color: var(--gray);
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

  // SVG Icon for PDF files, inspired by the official logo
  const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="48" height="48">
      <path fill="#F40F02" d="M8 2H42C44.2 2 46 3.8 46 6V44C46 46.2 44.2 48 42 48H8C5.8 48 4 46.2 4 44V6C4 3.8 5.8 2 8 2Z" />
      <path fill="#FFFFFF" d="M17.1,29.2h-2.4v-9.5h4.4c1.8,0,2.9,0.4,3.7,1.1c0.8,0.7,1.2,1.8,1.2,3.1c0,1.3-0.4,2.3-1.2,3.1c-0.8,0.7-1.9,1.1-3.7,1.1h-2V29.2z M17.1,27.1h1.4c1.1,0,1.9-0.2,2.4-0.7c0.5-0.5,0.8-1.2,0.8-2.1c0-0.9-0.3-1.6-0.8-2.1c-0.5-0.5-1.3-0.7-2.4-0.7h-1.4V27.1z" />
      <path fill="#FFFFFF" d="M26.6,29.2h-2.4V19.7h2.4V29.2z" />
      <path fill="#FFFFFF" d="M37.2,29.2h-2.4l-3.3-4.8h-0.1v4.8h-2.2V19.7h2.4c1.8,0,2.9,0.4,3.7,1.1c0.8,0.7,1.2,1.8,1.2,3.1c0,1.2-0.3,2.2-0.9,2.9l3.5,5.4H37.2z M33.7,21.8h-1.4v4.4h1.4c1.1,0,1.9-0.2,2.4-0.7c0.5-0.5,0.8-1.1,0.8-2c0-0.8-0.3-1.5-0.8-2C35.6,22,34.8,21.8,33.7,21.8z" />
    </svg>
  );

  // SVG Icon for Word files, inspired by the official logo
  const WordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="48" height="48">
      <path fill="#2B579A" d="M8 2H42C44.2 2 46 3.8 46 6V44C46 46.2 44.2 48 42 48H8C5.8 48 4 46.2 4 44V6C4 3.8 5.8 2 8 2Z" />
      <path fill="#FFFFFF" d="M14.6,19.7h3.2l2.4,6.8h0.1l2.4-6.8h3.2v9.5h-2.3V22h-0.1l-2.7,7.2h-1.6l-2.7-7.2h-0.1v7.2h-2.3V19.7z" />
      <path fill="#FFFFFF" d="M35.4,24.4c0-1.3-0.4-2.3-1.2-3.1c-0.8-0.7-1.9-1.1-3.3-1.1c-1.4,0-2.5,0.4-3.3,1.1c-0.8,0.7-1.2,1.8-1.2,3.1c0,1.3,0.4,2.4,1.2,3.1c0.8,0.7,1.9,1.1,3.3,1.1c1.4,0,2.5-0.4,3.3-1.1C35,26.8,35.4,25.7,35.4,24.4z M33.2,24.4c0,0.9-0.2,1.5-0.7,2c-0.5,0.5-1.1,0.7-1.9,0.7c-0.8,0-1.4-0.2-1.9-0.7c-0.5-0.5-0.7-1.2-0.7-2c0-0.9,0.2-1.5,0.7-2c0.5-0.5,1.1-0.7,1.9-0.7c0.8,0,1.4,0.2,1.9,0.7C33,22.9,33.2,23.5,33.2,24.4z" />
    </svg>
  );

  // Helper function to get an icon based on the file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <PdfIcon />;
    }
    if (fileType.includes('wordprocessingml')) { // for .docx
      return <WordIcon />;
    }
    if (fileType.includes('image')) {
      return '🖼️'; // Framed picture for images
    }
    if (fileType.includes('text')) {
      return '🗒️'; // Spiral notepad for text
    }
    return '📄'; // Default document icon
  };

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
      <Thumbnail>{getFileIcon(document.fileType)}</Thumbnail>
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
              {showDetails ? 'Hide Summary' : 'Show Summary'}
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