import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Building, Phone, Mail, MapPin, KeyRound, 
  Save, CheckCircle, AlertCircle, Shield, FileText 
} from 'lucide-react';

const Profile = () => {
  const { businessProfile, updateBusinessProfile, changeAdminPin, isAdmin } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    business_name: businessProfile?.business_name || '',
    technician_name: businessProfile?.technician_name || '',
    phone: businessProfile?.phone || '',
    email: businessProfile?.email || '',
    address: businessProfile?.address || '',
    notes: businessProfile?.notes || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinSuccess, setPinSuccess] = useState(null);
  const [pinError, setPinError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      updateBusinessProfile(formData);
      setSuccessMsg('Business details updated successfully! All generated A4 PDFs will reflect these details.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAdminPin = (e) => {
    e.preventDefault();
    setPinSuccess(null);
    setPinError(null);

    try {
      changeAdminPin(adminPinInput);
      setPinSuccess('Admin PIN/Password updated successfully!');
      setAdminPinInput('');
      setTimeout(() => setPinSuccess(null), 4000);
    } catch (err) {
      setPinError(err.message || 'Failed to update PIN.');
    }
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '800px' }}>
      
      {/* Page Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Building size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Business Settings & PDF Header
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Customize your company name, contact numbers, and branding printed on material PDF lists.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6ee7b7',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#3b82f6" /> Contractor / Business Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Building size={14} /> Business / Firm Name
              </label>
              <input
                type="text"
                required
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g. ElectroPlumb Services"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Technician / Contractor Name
              </label>
              <input
                type="text"
                name="technician_name"
                value={formData.technician_name}
                onChange={handleChange}
                placeholder="e.g. Savaad Muhammed"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Phone size={14} /> Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={14} /> Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. contact@electroplumb.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">
              <MapPin size={14} /> Address / City
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Main Road, City, State"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">
              Tagline / Footer Note (Appears on PDF Footer)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Quality Electrical & Plumbing Contractor Solutions"
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </div>
      </form>

      {/* Admin Security Settings Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="#60a5fa" /> Admin Password & Security
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
          Change the password used to unlock the Admin Panel and catalog management tools.
        </p>

        {pinSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.825rem'
          }}>
            {pinSuccess}
          </div>
        )}

        {pinError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.825rem'
          }}>
            {pinError}
          </div>
        )}

        <form onSubmit={handleUpdateAdminPin} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
            <label className="form-label">
              <KeyRound size={14} /> New Admin PIN / Password
            </label>
            <input
              type="password"
              required
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="e.g. admin123"
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-outline" style={{ height: '42px' }}>
            Update Admin Password
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;
