import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SignUp = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  navigate('/store');

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
        <h1 className='text-5xl font-bdogrotesk font-medium m-auto'>Hey Welcome to Nufab!!</h1>
      </div>
    );
  }

  console.log('SignUp component rendered');

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f5f5f5' }}>
      <h1 className='text-5xl m-auto'>Hey Welcome to Nufab!!</h1>
    </div>
  );
};

export default SignUp;
