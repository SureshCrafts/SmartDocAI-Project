// frontend/src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components'; // For styling
import { toast } from 'react-toastify'; // For notifications
import { useAuth } from '../context/AuthContext'; // NEW

// Styled Components for our Header
// THESE DEFINITIONS MUST BE OUTSIDE THE FUNCTION COMPONENT
const HeaderContainer = styled.header`
  background-color: #333;
  color: #fff;
  padding: 1rem 0;
  margin-bottom: 20px; /* Add some space below the header */
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Brand = styled.h1`
  font-size: 1.8rem;
  a {
    color: #fff;
    text-decoration: none;
  }
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
`;

const NavItem = styled.li`
  margin-left: 20px;
`;

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }
`;

const LogoutButton = styled.button`
  background-color: #dc3545; /* Red color for logout */
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

function Header() { // <-- The Header function starts here
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();

    const logoutHandler = () => {
        authLogout();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    return (
        <HeaderContainer>
            <Nav>
                <Brand>
                    <Link to="/">SmartDoc AI</Link>
                </Brand>
                <NavLinks>
                    {user ? (
                        <>
                            <NavItem>
                                <NavLink to="/">{user.username}</NavLink>
                            </NavItem>
                            <NavItem>
                                <LogoutButton onClick={logoutHandler}>Logout</LogoutButton>
                            </NavItem>
                        </>
                    ) : (
                        <>
                            <NavItem>
                                <NavLink to="/login">Login</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="/register">Register</NavLink>
                            </NavItem>
                        </>
                    )}
                </NavLinks>
            </Nav>
        </HeaderContainer>
    );
}

export default Header;