import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import NotesApp from './components/NotesApp';

// Configure axios with base URL (uses proxy in development)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();

    // Set up interval to check auth status every 30 seconds
    const interval = setInterval(checkAuthStatus, 30000);

    return () => clearInterval(interval);
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

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
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

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  }
};

export default App;