import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import NotesApp from './components/NotesApp';
import V2 from './routes/v2';

// Configure axios with base URL to the API server.
// In production, VITE_API_URL should point to the backend origin, e.g. https://notes-db-server-....vercel.app
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check authentication status on app load
  useEffect(() => {
    const handlePathChange = () => setCurrentPath(window.location.pathname);

    if (window.location.pathname === '/v2') {
      setIsLoading(false);
      return;
    }

    checkAuthStatus();

    // Set up interval to check auth status every 30 seconds
    const interval = setInterval(checkAuthStatus, 30000);
    window.addEventListener('popstate', handlePathChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/verify');
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setTokenExpiry(response.data.expiresAt);
      } else {
        setIsAuthenticated(false);
        setTokenExpiry(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setTokenExpiry(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (currentPath === '/v2') {
    return <V2 />;
  }

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

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