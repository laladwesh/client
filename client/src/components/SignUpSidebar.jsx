import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SignUpSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const onToggle = (e) => {
      const open = e?.detail?.open ?? !isOpen;
      if (open) {
        setMounted(true);
        setClosing(false);
        setIsOpen(true);
      } else {
        setClosing(true);
        setIsOpen(false);
        setTimeout(() => setMounted(false), 300);
      }
    };
    window.addEventListener('signup:toggle', onToggle);
    return () => window.removeEventListener('signup:toggle', onToggle);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleDemoLogin = async () => {
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
      toast.success('Signed in as Demo User');
      setClosing(true);
      setIsOpen(false);
      setTimeout(() => setMounted(false), 300);
    } catch (e) {
      setError('Demo login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Signed out');
    setClosing(true);
    setIsOpen(false);
    //refresh
        setTimeout(() => setMounted(false), 300);
  window.location.reload();
      };


  if (!mounted) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 z-[11000]" onClick={() => { setClosing(true); setIsOpen(false); setTimeout(() => setMounted(false), 300); }} />
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[11001] shadow-2xl flex flex-col drawer-panel ${closing ? 'drawer-slide-out' : 'drawer-slide-in'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">Sign In</h3>
          <button onClick={() => { setClosing(true); setIsOpen(false); setTimeout(() => setMounted(false), 300); }} className="px-3 py-1 rounded bg-gray-100 text-sm">Close</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {user ? (
            <div className="text-center">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
              <h4 className="font-semibold">Welcome, {user.name}</h4>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              <div className="flex gap-2 justify-center">
                {user.role === 'admin' && (
                  <button onClick={() => window.location.href = '/admin'} className="px-4 py-2 bg-gray-800 text-white rounded">Admin Panel</button>
                )}
                <button onClick={() => window.location.href = '/store'} className="px-4 py-2 bg-blue-600 text-white rounded">Browse Store</button>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
              </div>
            </div>
          ) : (
            <div>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>}
              <button onClick={handleGoogleLogin} className="w-full py-3 mb-4 border rounded flex items-center justify-center gap-3">Sign in with Google</button>
              <div className="text-center text-gray-400 mb-4">OR</div>
              <button onClick={handleDemoLogin} className="w-full py-3 bg-green-600 text-white rounded">Continue as Demo User</button>
              <p className="text-xs text-gray-500 mt-4">By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
