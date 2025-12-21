import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SignUp = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  

  useEffect(() => {
    // Check if returning from Google OAuth
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      return;
    }

    if (token && userParam) {
      const userData = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      // session stored in localStorage (no context)
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/store');
      }
      return;
    }

    // Check existing session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleDemoLogin = async () => {
    // Demo login for testing
    try {
      const demoUser = {
        _id: 'demo123',
        name: 'Demo User',
        email: 'demo@nufab.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4285F4&color=fff',
        role: 'user'
      };
      
      const demoToken = 'demo-jwt-token-12345';
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      // session stored in localStorage (no context)
      navigate('/store');
    } catch (err) {
      setError('Demo login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };
  

  if (user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <img src={user.avatar} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1.5rem', border: '4px solid #f0f0f0' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Welcome, {user.name}!</h2>
          <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{user.email}</p>
          <p style={{ color: user.role === 'admin' ? '#e74c3c' : '#27ae60', fontWeight: 'bold', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {user.role === 'admin' ? '👑 Admin Account' : '✓ User Account'}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '0.75rem 1.5rem', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                Admin Panel
              </button>
            )}
            <button onClick={() => navigate('/store')} style={{ padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
              Browse Store
            </button>
            <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('SignUp component rendered');

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '450px', width: '100%', textAlign: 'center', background: 'white', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', color: '#333' }}>Sign In</h1>
        <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1rem' }}>Sign in to access your Nufab account</p>

        {error && (
          <div style={{ padding: '1rem', background: '#fee', color: '#c33', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            width: '100%', 
            padding: '14px 24px', 
            background: 'white', 
            border: '2px solid #4285F4', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1rem', 
            fontWeight: '500', 
            transition: 'all 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style={{ color: '#333', fontWeight: '600' }}>Sign in with Google</span>
        </button>

        <div style={{ margin: '1rem 0', color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>OR</div>

        <button 
          onClick={handleDemoLogin}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            width: '100%', 
            padding: '14px 24px', 
            background: '#27ae60', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1rem', 
            fontWeight: '600', 
            transition: 'all 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: 'white'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#229954';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#27ae60';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <span>Continue as Demo User</span>
        </button>

        <div style={{ margin: '1.5rem 0', color: '#999', fontSize: '0.9rem' }}>
          <p style={{ fontWeight: '600', color: '#e74c3c' }}>⚠️ Google OAuth Timing Out?</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Use Demo Login above to test the app</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Check your internet connection to accounts.google.com</p>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#999' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignUp;
