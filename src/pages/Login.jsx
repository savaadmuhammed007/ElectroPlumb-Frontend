import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, Wrench, Lock, User, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(username, password);
      if (loggedUser.is_staff || loggedUser.profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userType) => {
    if (userType === 'worker') {
      setUsername('savaad');
      setPassword('worker123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 130px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.15), transparent 40%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem 1.25rem' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #d97706 0%, #2563eb 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '0.65rem',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
          }}>
            <Zap size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Worker Login
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            ElectroPlumb Material List Manager
          </p>
        </div>

        {/* Quick Fill Demo Credentials Buttons */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.65rem',
          marginBottom: '1.25rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            ⚡ QUICK DEMO ONE-CLICK LOGINS
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('worker')}
              className="btn btn-sm btn-elec"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
            >
              <Zap size={13} /> Savaad (Worker)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-sm btn-plumb"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
            >
              <Wrench size={13} /> Admin User
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.825rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <User size={14} /> Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. savaad or admin"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                <Lock size={14} /> Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ fontSize: '0.75rem', color: '#3b82f6' }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Google Sign In Button */}
        <GoogleSignInButton label="Sign In with Google" />

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3b82f6', fontWeight: 700 }}>
            Register New Worker
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#f8fafc' }}>
              <KeyRound size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Password Reset</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
              Enter your registered username or email address below to receive password recovery instructions.
            </p>
            <input
              type="text"
              placeholder="Username or Email"
              className="form-input"
              style={{ marginBottom: '0.85rem' }}
            />
            {forgotMsg && (
              <p style={{ color: '#34d399', fontSize: '0.8rem', marginBottom: '0.85rem' }}>{forgotMsg}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotMsg(''); }}
                className="btn btn-sm btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setForgotMsg('Reset link dispatched! Contact admin if password reset fails.')}
                className="btn btn-sm btn-primary"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
