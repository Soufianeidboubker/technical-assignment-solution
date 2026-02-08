import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = isRegister
        ? await authApi.register(email, password, name)
        : await authApi.login(email, password);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/board/1');
    } catch (err: any) {
      setError(err?.error?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginTop: 0 }}>
          {isRegister ? 'Create Account' : 'Login'}
        </h1>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.5rem', 
              background: '#fee', 
              color: '#c00',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <strong>Demo Account:</strong><br />
          Email: demo@example.com<br />
          Password: password123
        </div>
      </div>
    </div>
  );
}