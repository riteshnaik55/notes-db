import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/login', { password });

      if (response.data.success) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>🔐 Secure Notes</h1>
        <p style={styles.subtitle}>Please enter your password to access your notes</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={styles.input}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Unlock Notes'}
          </button>
        </form>

        <div style={styles.securityInfo}>
          <p style={styles.infoText}>🔒 Your session is protected with:</p>
          <ul style={styles.infoList}>
            <li>JWT token authentication</li>
            <li>5-minute session timeout</li>
            <li>HTTP-only secure cookies</li>
            <li>Rate-limited login attempts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '100%'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    width: '100%'
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '14px',
    textAlign: 'center'
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  securityInfo: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px'
  },
  infoText: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px',
    textAlign: 'center'
  },
  infoList: {
    fontSize: '11px',
    color: '#888',
    paddingLeft: '20px',
    margin: 0
  }
};

export default Login;