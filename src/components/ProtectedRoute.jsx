import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, KeyRound, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAdmin, adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!adminOnly) {
    return children;
  }

  // If already authenticated as admin, render admin page
  if (isAdmin) {
    return children;
  }

  const handleAdminUnlock = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(pinInput);
    } catch (err) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  // Sleek Admin PIN / Password unlock prompt
  return (
    <div style={{
      minHeight: 'calc(100vh - 130px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.12), transparent 60%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2rem 1.5rem', textAlign: 'center' }}>
        
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginBottom: '1rem',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)'
        }}>
          <Shield size={30} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem 0' }}>
          Admin Panel Access
        </h2>
        <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Enter the administrator password to manage catalog materials, Google Sheets sync, and database settings.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminUnlock} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <KeyRound size={14} color="#3b82f6" /> Admin Password / PIN
            </label>
            <input
              type="password"
              required
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Default: admin123"
              className="form-input"
              style={{ fontSize: '0.95rem', letterSpacing: '0.05em' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !pinInput.trim()}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
          >
            {loading ? 'Verifying...' : 'Unlock Admin Panel'} <ArrowRight size={16} />
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: '#94a3b8' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

      </div>
    </div>
  );
};

export default ProtectedRoute;
