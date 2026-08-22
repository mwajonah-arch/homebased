import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Supabase access tokens carry the app-specific fields we set at sign-up
// (name, role, phone, etc.) nested under `user_metadata`, NOT at the top
// level of the JWT. The top-level `role` claim is Supabase's own Postgres
// role ("authenticated"), which is not the same thing as our app role.
const parseUser = (token) => {
  const decoded = jwt_decode(token);
  const metadata = decoded.user_metadata || {};
  return {
    id: decoded.sub,
    email: decoded.email,
    name: metadata.name,
    role: metadata.role,
    phone: metadata.phone,
    address: metadata.address,
    city: metadata.city,
    state: metadata.state,
    zipCode: metadata.zip_code,
  };
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
        setUser(parseUser(token));
      } catch (err) {
        // Invalid token
        setToken('');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  // Login function. Returns the parsed user so callers (login/register
  // pages) can make an immediate routing decision without re-decoding.
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const parsed = parseUser(newToken);
      setUser(parsed);
      return parsed;
    } catch (err) {
      setUser(null);
      return null;
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