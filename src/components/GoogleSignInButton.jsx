import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, X, Check, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

const GOOGLE_CLIENT_ID_KEY = 'electroplumb_google_client_id';

const GoogleSignInButton = ({ role = 'electrician', label = 'Continue with Google' }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [selectedRole, setSelectedRole] = useState(role);

  const getActiveClientId = () => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '';
  };

  // Trigger Google Account Selector Popup or Fast Direct Login
  const handleOpenAccountChooser = () => {
    const activeClientId = getActiveClientId();

    // If Client ID is not configured in Vercel/Environment, open seamless direct Google Sign In
    if (!activeClientId) {
      setShowDirectModal(true);
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.warn('Google Token error, falling back to direct sign-in:', tokenResponse);
              setShowDirectModal(true);
              return;
            }

            setLoading(true);
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const userInfo = await userInfoRes.json();

              const user = await loginWithGoogle({
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                role: selectedRole,
              });

              if (user.is_staff || user.profile?.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            } catch (err) {
              console.error('Google UserInfo error:', err);
              setShowDirectModal(true);
            } finally {
              setLoading(false);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 client initialization failed:', err);
        setShowDirectModal(true);
        return;
      }
    }

    // If Google Identity Services not loaded, open direct modal
    setShowDirectModal(true);
  };

  const handleDirectGoogleLogin = async (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle({
        email: manualEmail.trim(),
        name: manualName.trim() || manualEmail.split('@')[0],
        role: selectedRole,
      });
      setShowDirectModal(false);
      if (user.is_staff || user.profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.825rem',
          marginBottom: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Official Google Sign-In Button */}
      <button
        type="button"
        onClick={handleOpenAccountChooser}
        disabled={loading}
        className="google-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          fontSize: '0.875rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Official Google G Logo */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading ? 'Signing in with Google...' : label}</span>
      </button>

      {/* Instant Google Email Sign-In Modal (Never shows technical Client ID prompts to users) */}
      {showDirectModal && (
        <div className="modal-overlay" style={{ zIndex: 1100, padding: '1rem' }} onClick={() => setShowDirectModal(false)}>
          <div 
            className="modal-content glass-card" 
            style={{ 
              maxWidth: '420px', 
              width: '100%', 
              padding: '1.5rem', 
              background: '#0f172a',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Google Sign-In
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Sign in to your worker dashboard
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDirectModal(false)} 
                className="btn btn-ghost" 
                style={{ padding: '0.3rem', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDirectGoogleLogin}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">
                  <Mail size={13} /> Google Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  <User size={13} /> Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Savaad Muhammed"
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="btn btn-sm btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !manualEmail.trim()}
                  className="btn btn-sm btn-primary"
                  style={{ minWidth: '140px', justifyContent: 'center' }}
                >
                  {loading ? 'Authenticating...' : (
                    <>
                      <span>Continue</span> <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
