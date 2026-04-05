import { useState } from 'react';
import { Network, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// localStorage key for the registered user registry
const USERS_KEY = 'nexus_registered_users';

const getRegisteredUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
};

const Auth = () => {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const { login } = useAppContext();
  const navigate  = useNavigate();

  const resetForm = () => { setError(''); setSuccess(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const users = getRegisteredUsers();

    if (isLogin) {
      // ── LOGIN ──────────────────────────────────────────────────────────────
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
      const existing = users[email.toLowerCase()];
      if (!existing) {
        setError('No account found with this email. Please sign up first.');
        return;
      }
      if (existing.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }
      // Successful login
      login({ name: existing.name, email: email.toLowerCase() });
      navigate('/dashboard');

    } else {
      // ── SIGN UP ───────────────────────────────────────────────────────────
      if (!name.trim()) { setError('Please enter your full name.'); return; }
      if (!email)       { setError('Please enter your email address.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

      if (users[email.toLowerCase()]) {
        setError('An account with this email already exists. Please login instead.');
        return;
      }

      // Register and auto-login
      users[email.toLowerCase()] = { name: name.trim(), password };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      setSuccess('Account created! Signing you in…');
      setTimeout(() => {
        login({ name: name.trim(), email: email.toLowerCase() });
        navigate('/dashboard');
      }, 800);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setName('');
    setPassword('');
  };

  return (
    <div
      className="container animate-fade-in"
      style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4rem)' }}
    >
      <div
        className="glass-panel"
        style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-secondary)', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <Network size={32} color="var(--accent-primary)" />
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              {isLogin
                ? 'Log in to access your personal dashboard and history.'
                : 'Sign up to start analysing your startup idea with AI.'}
            </p>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full name — signup only */}
            {!isLogin && (
              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" style={{ fontSize: '0.8rem' }}>Full Name</label>
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                  <User size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Jane Doe"
                    style={{ paddingLeft: '2.75rem' }}
                    value={name}
                    onChange={e => { setName(e.target.value); resetForm(); }}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  style={{ paddingLeft: '2.75rem' }}
                  value={email}
                  onChange={e => { setEmail(e.target.value); resetForm(); }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ fontSize: '0.8rem' }}>Password</label>
                {!isLogin && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Minimum 6 characters</span>
                )}
              </div>
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={e => { setPassword(e.target.value); resetForm(); }}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={switchMode}
                style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {isLogin ? 'Sign up free' : 'Log in'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
