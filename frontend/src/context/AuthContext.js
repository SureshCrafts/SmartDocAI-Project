// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initial state: try to load user from localStorage
    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error("Failed to parse userInfo from localStorage", error);
            return null;
        }
    });

    // Function to log in a user (stores in localStorage and updates state)
    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    // Function to log out a user (removes from localStorage and updates state)
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    // This effect runs once on mount to ensure initial state is correct,
    // though the useState initializer should handle most of it.
    useEffect(() => {
        // You might still want to call this if there's external state changes
        // that affect local storage, but for simple login/logout, the functions
        // themselves are sufficient to keep state in sync.
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};