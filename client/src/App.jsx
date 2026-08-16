import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import NotesApp from './components/NotesApp';

// Configure axios with base URL to the API server.
// In production, VITE_API_URL should point to the backend origin, e.g. https://notes-db-server-....vercel.app
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setTokenExpiry(null);
    }
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <NotesApp onLogout={handleLogout} tokenExpiry={tokenExpiry} />
      )}
    </div>
  );
}

export default App;