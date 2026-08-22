import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on startup
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser(decoded);
      } catch (err) {
        // Invalid token
        setToken('');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  // Login function
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const decoded = jwt_decode(newToken);
      setUser(decoded);
    } catch (err) {
      setUser(null);
    }
  };

  // Logout function
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    updateUser
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;