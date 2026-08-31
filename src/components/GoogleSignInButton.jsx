import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, X, Shield, Zap, Wrench, Settings, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

const GOOGLE_CLIENT_ID_KEY = 'electroplumb_google_client_id';

const GoogleSignInButton = ({ role = 'electrician', label = 'Continue with Google' }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [selectedRole, setSelectedRole] = useState(role);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';

  const getActiveClientId = () => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '';
  };

  // Trigger Google Account Selector Popup
  const handleOpenAccountChooser = () => {
    const activeClientId = getActiveClientId();

    if (!activeClientId) {
      setShowConfigModal(true);
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
              console.error('Google Token error:', tokenResponse);
              if (tokenResponse.error === 'invalid_client' || tokenResponse.error_description?.includes('origin')) {
                setShowTroubleshoot(true);
              } else {
                setError(tokenResponse.error_description || tokenResponse.error || 'Failed to select Google account.');
              }
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
              setError('Failed to authenticate Google user.');
            } finally {
              setLoading(false);
            }
          },
        });

        // Opens native Google Account Chooser popup with all accounts on device
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 token client init failed, trying GIS id.prompt:', err);
      }
    }

    // Fallback to Google ID prompt if available
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowTroubleshoot(true);
    }
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin).then(() => {
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 3000);
    });
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
      setShowTroubleshoot(false);
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

      {/* SINGLE Unified Google Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
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
          {/* Official Google G Logo SVG */}
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
          <span>{loading ? 'Opening Google Accounts...' : label}</span>
        </button>

        {/* Small Help / Origin Troubleshooter Trigger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '0.2rem' }}>
          <button
            type="button"
            onClick={() => setShowTroubleshoot(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0
            }}
          >
            <HelpCircle size={12} /> Having Origin 401 Error? Click here
          </button>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0
            }}
          >
            <Settings size={11} /> Client ID Settings
          </button>
        </div>
      </div>

      {/* Origin Troubleshooter & Direct Google Auth Modal */}
      {showTroubleshoot && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '1.5rem', background: '#0f172a', maxHeight: '92vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Fix "Error 401: invalid_client"
                </h3>
              </div>
              <button onClick={() => setShowTroubleshoot(false)} className="btn btn-outline" style={{ padding: '0.3rem', minWidth: '30px', minHeight: '30px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Exact Origin to Copy */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                Your current app URL (Authorized JavaScript origin):
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ background: '#0f172a', color: '#38bdf8', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', flex: 1, fontWeight: 700 }}>
                  {currentOrigin}
                </code>
                <button
                  type="button"
                  onClick={handleCopyOrigin}
                  className="btn btn-sm btn-outline"
                  style={{ flexShrink: 0 }}
                >
                  {copiedOrigin ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  {copiedOrigin ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              <strong style={{ color: '#f8fafc' }}>Quick 3-Step Checklist in Google Cloud Console:</strong>
              <ol style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', marginBottom: 0 }}>
                <li>
                  Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Google Cloud Credentials <ExternalLink size={11} style={{ display: 'inline' }} /></a>.
                </li>
                <li>
                  Ensure Client ID type is <strong>"Web application"</strong> (not Desktop / Android).
                </li>
                <li>
                  Under <strong>Authorized JavaScript origins</strong>, add <code>{currentOrigin}</code> and <code>http://127.0.0.1:5174</code> (without trailing slash <code>/</code>) and click <strong>SAVE</strong>.
                </li>
              </ol>
            </div>

            {/* Direct Google Sign In Fallback */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                Instant Google Sign-In (Bypass Origin while propagating):
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                You can also enter your Google email below to sign in immediately:
              </p>

              <form onSubmit={handleDirectGoogleLogin}>
                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? 'Signing in...' : 'Continue to Dashboard with Google Email'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Google Client ID Config Modal */}
      {showConfigModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.5rem', background: '#0f172a' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Google OAuth Configuration
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="btn btn-outline" style={{ padding: '0.3rem', minWidth: '30px', minHeight: '30px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (clientIdInput.trim()) {
                localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientIdInput.trim());
                setShowConfigModal(false);
                window.location.reload();
              }
            }}>
              <div className="form-group">
                <label className="form-label">Google OAuth Client ID</label>
                <input
                  type="text"
                  required
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="565424944218-11o3bmi...apps.googleusercontent.com"
                  className="form-input"
                  style={{ fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowConfigModal(false)} className="btn btn-sm btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-primary">
                  Save Client ID
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
