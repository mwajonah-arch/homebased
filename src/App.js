import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetail from './pages/ServiceDetail';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Container className="d-flex justify-content-center align-items-center vh-100"><div>Loading...</div></Container>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* Protected routes - Client */}
        <Route path="/client/dashboard" element={user && user.role === 'client' ? <ClientDashboard /> : <Navigate to="/" replace />} />
        <Route path="/client/bookings" element={user && user.role === 'client' ? <ClientDashboard /> : <Navigate to="/" replace />} />

        {/* Protected routes - Provider */}
        <Route path="/provider/dashboard" element={user && (user.role === 'nurse' || user.role === 'caregiver') ? <ProviderDashboard /> : <Navigate to="/" replace />} />
        <Route path="/provider/services" element={user && (user.role === 'nurse' || user.role === 'caregiver') ? <ProviderDashboard /> : <Navigate to="/" replace />} />
        <Route path="/provider/services/new" element={user && (user.role === 'nurse' || user.role === 'caregiver') ? <ProviderDashboard /> : <Navigate to="/" replace />} />
        <Route path="/provider/services/edit/:id" element={user && (user.role === 'nurse' || user.role === 'caregiver') ? <ProviderDashboard /> : <Navigate to="/" replace />} />

        {/* Redirect to home if not authenticated for protected routes */}
        <Route path="/client/*" element={!user ? <Navigate to="/login" replace /> : null} />
        <Route path="/provider/*" element={!user ? <Navigate to="/login" replace /> : null} />

        {/* 404 */}
        <Route path="*" element={<div className="container mt-5"><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;