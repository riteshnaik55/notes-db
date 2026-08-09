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
    <div className="login-container h-screen flex flex-col place-content-center align-center text-center gap-5">
        <h1>Notes</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-container border-1 bg-gray-500 rounded-md p-2 w-sm mx-auto">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoFocus
              autocomplete="current-password"
              className="bg-transparent border-none outline-none text-white w-full"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
    </div>
  );
}

export default Login;