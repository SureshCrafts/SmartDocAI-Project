// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <--- NEW: Import Dashboard

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="container">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* The Dashboard component will be the default route for logged-in users */}
            <Route path="/" element={<Dashboard />} /> {/* <--- CHANGED: Set Dashboard as home */}
            {/* You can uncomment these later if you implement specific document details page */}
            {/* <Route path="/document/:id" element={<DocumentDetails />} /> */}
          </Routes>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </AuthProvider>
    </Router>
  );
}

export default App;