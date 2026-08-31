import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Zap, Wrench, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    email: '',
    phone: '',
    role: 'electrician',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const user = await register(formData);
      if (user.is_staff || user.profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes) {
        if (typeof errRes === 'object') {
          const firstKey = Object.keys(errRes)[0];
          setError(`${firstKey}: ${errRes[firstKey]}`);
        } else {
          setError('Registration failed. Please check inputs.');
        }
      } else {
        setError('Network error during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 130px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      background: 'radial-gradient(circle at top left, rgba(20, 184, 166, 0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.15), transparent 40%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem 1.25rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Worker Registration
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Create your account to start generating material requirement lists
          </p>
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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Choice Pills */}
          <div className="form-group">
            <label className="form-label">
              <Shield size={14} /> Professional Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'electrician' })}
                className={`btn btn-sm ${formData.role === 'electrician' ? 'btn-elec' : 'btn-outline'}`}
                style={{ justifyContent: 'center' }}
              >
                <Zap size={15} /> Electrician
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'plumber' })}
                className={`btn btn-sm ${formData.role === 'plumber' ? 'btn-plumb' : 'btn-outline'}`}
                style={{ justifyContent: 'center' }}
              >
                <Wrench size={15} /> Plumber
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label"><User size={14} /> Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. rahim_elec"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><User size={14} /> Full Name</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. Abdul Rahim"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label"><Mail size={14} /> Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahim@gmail.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Phone size={14} /> Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label"><Lock size={14} /> Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Lock size={14} /> Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Worker Registration'} <ArrowRight size={16} />
          </button>
        </form>

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Google Sign In Button */}
        <GoogleSignInButton role={formData.role} label="Sign Up with Google" />

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: '#94a3b8' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
