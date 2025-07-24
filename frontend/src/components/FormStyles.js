// frontend/src/components/FormStyles.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const FormContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 40px;
  background: var(--charcoal);
  border-radius: 8px;
  border: 1px solid var(--jet);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FormTitle = styled.h1`
  text-align: center;
  margin-bottom: 25px;
  color: #fff;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--jet);
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  background-color: var(--black);
  color: var(--light-gray);
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--blue);
  }

  &::placeholder {
    color: var(--gray);
  }
`;

export const Button = styled.button`
  background-color: var(--blue);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: #0077cc;
  }
`;

export const FormText = styled.p`
  margin-top: 20px;
  text-align: center;
  color: var(--gray);
`;

export const FormLink = styled(Link)`
  color: var(--blue);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;