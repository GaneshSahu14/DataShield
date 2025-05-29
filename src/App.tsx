import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanHistory from './pages/ScanHistory';
import Settings from './pages/Settings';
import Auth from './pages/Auth'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Store email from login

    const handleLogin = (email: string, password: string, remember: boolean) => {
        // In a real app, this would be an API call
        console.log('Login attempt:', { email, password, remember });
        setIsAuthenticated(true);
        setUserEmail(email); // Store the email on successful login
        if (remember) {
            localStorage.setItem('userEmail', email); // Persist email if "Remember me" is checked
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserEmail(''); // Clear email on logout
        localStorage.removeItem('userEmail'); // Remove persisted email
    };

    // Check local storage for remembered email on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setIsAuthenticated(true);
            setUserEmail(storedEmail);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    } 
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Dashboard onLogout={handleLogout} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/history" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ScanHistory onLogout={handleLogout} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Settings onLogout={handleLogout} userEmail={userEmail} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/auth" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Auth />
                        </ProtectedRoute>
                    } 
                />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </div>
    );
}

export default App;