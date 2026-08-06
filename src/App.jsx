import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithGoogle, logout, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './Dashboard';
import EventPage from './EventPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="app-container">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="app-container login-layout">
        <div className="login-card">
          <div className="brand">
            <div className="brand-icon" style={{ overflow: 'hidden', padding: '0', border: 'none', background: 'transparent' }}>
              <img src="/logo.png" alt="Kaziranga House Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1>Kaziranga House</h1>
            <p className="subtitle">BEYOND LIMITS</p>
            <p className="login-restriction">Login restricted to IITM IDs</p>
          </div>

          <button onClick={handleLogin} className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.86C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.86z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Join the Forest
          </button>

          {error && (
            <div className="error-message">
              <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} handleLogout={handleLogout} />} />
        <Route path="/event/:id" element={<EventPage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
