import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, Phone, Mail, MapPin, Building, KeyRound, 
  Save, CheckCircle, AlertCircle, MessageSquare, Shield 
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    profile: {
      role: user?.profile?.role || 'electrician',
      phone: user?.profile?.phone || '',
      whatsapp: user?.profile?.whatsapp || '',
      business_name: user?.profile?.business_name || '',
      address: user?.profile?.address || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || '',
      pin_code: user?.profile?.pin_code || '',
      about: user?.profile?.about || '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.profile) {
      setFormData({
        ...formData,
        profile: { ...formData.profile, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully! All future generated A4 PDFs will reflect these business details.');
    } catch (err) {
      setErrorMsg('Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await api.post('/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordMsg('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.old_password?.[0] || 'Failed to update password.');
    }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '800px' }}>
      
      {/* Page Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span className={`badge ${user?.profile?.role === 'plumber' ? 'badge-plumb' : 'badge-elec'}`}>
              {user?.profile?.role || 'worker'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{user?.id}</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Worker & Business Profile
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Your business information automatically appears on all generated PDF requirement sheets.
          </p>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="btn btn-sm btn-outline"
        >
          <KeyRound size={15} /> Change Password
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '1.25rem' }}>
        
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          Personal & Professional Details
        </h3>

        <div className="grid-2" style={{ gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label"><User size={13} /> First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleProfileChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><User size={13} /> Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleProfileChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid-2" style={{ gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label"><Mail size={13} /> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Shield size={13} /> Primary Role</label>
            <select
              name="role"
              value={formData.profile.role}
              onChange={handleProfileChange}
              className="form-select"
            >
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="general">General Contractor</option>
            </select>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '1.25rem 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          Business & PDF Branding Header Information
        </h3>

        <div className="form-group">
          <label className="form-label"><Building size={13} /> Business / Enterprise Name</label>
          <input
            type="text"
            name="business_name"
            value={formData.profile.business_name}
            onChange={handleProfileChange}
            placeholder="e.g. Savaad Electrical & Plumbing Works"
            className="form-input"
          />
        </div>

        <div className="grid-2" style={{ gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label"><Phone size={13} /> Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.profile.phone}
              onChange={handleProfileChange}
              placeholder="+91 98765 43210"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><MessageSquare size={13} /> WhatsApp Number</label>
            <input
              type="text"
              name="whatsapp"
              value={formData.profile.whatsapp}
              onChange={handleProfileChange}
              placeholder="+91 98765 43210"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label"><MapPin size={13} /> Street Address</label>
          <input
            type="text"
            name="address"
            value={formData.profile.address}
            onChange={handleProfileChange}
            placeholder="1st Floor, Building #45, Main Road"
            className="form-input"
          />
        </div>

        <div className="grid-3" style={{ gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              value={formData.profile.city}
              onChange={handleProfileChange}
              placeholder="Calicut"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              name="state"
              value={formData.profile.state}
              onChange={handleProfileChange}
              placeholder="Kerala"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PIN Code</label>
            <input
              type="text"
              name="pin_code"
              value={formData.profile.pin_code}
              onChange={handleProfileChange}
              placeholder="673020"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">About / Professional Bio</label>
          <textarea
            name="about"
            rows="3"
            value={formData.profile.about}
            onChange={handleProfileChange}
            placeholder="Brief description of your expertise and certifications..."
            className="form-textarea"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Profile Settings'}
        </button>

      </form>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f8fafc' }}>
              <KeyRound size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Update Password</h3>
            </div>

            {passwordMsg && (
              <p style={{ color: '#34d399', fontSize: '0.825rem', marginBottom: '0.75rem' }}>{passwordMsg}</p>
            )}

            {passwordError && (
              <p style={{ color: '#fca5a5', fontSize: '0.825rem', marginBottom: '0.75rem' }}>{passwordError}</p>
            )}

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
