import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Shield, Users, Zap, Wrench, FileText, Layers, Activity 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>Loading admin dashboard statistics...</div>;
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderLeft: '6px solid #14b8a6', padding: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Shield size={18} color="#14b8a6" />
            <span className="badge badge-plumb">ADMIN DASHBOARD</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            System Analytics & Administration
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Manage the electrical & plumbing material database, system users, and usage stats.
          </p>
        </div>

        <Link to="/admin/items" className="btn btn-plumb">
          <Layers size={18} /> Manage Material Catalog
        </Link>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        
        <div className="glass-card" style={{ borderTop: '4px solid #3b82f6', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#60a5fa', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>TOTAL USERS</span>
            <Users size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats?.total_users || 0}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Workers & Admins</span>
        </div>

        <div className="glass-card" style={{ borderTop: '4px solid #d97706', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fbbf24', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>ELECTRICAL</span>
            <Zap size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
            {stats?.total_electrical_items || 0}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Materials</span>
        </div>

        <div className="glass-card" style={{ borderTop: '4px solid #0d9488', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#2dd4bf', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>PLUMBING</span>
            <Wrench size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2dd4bf' }}>
            {stats?.total_plumbing_items || 0}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Materials</span>
        </div>

        <div className="glass-card" style={{ borderTop: '4px solid #8b5cf6', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#c084fc', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>TOTAL LISTS</span>
            <FileText size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats?.total_lists || 0}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {stats?.lists_today || 0} Created Today
          </span>
        </div>

      </div>

      {/* Visual Distribution Chart & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Category Usage Breakdown */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#3b82f6" /> List Usage Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>Electrical ({stats?.electrical_lists || 0})</span>
                <span style={{ color: '#94a3b8' }}>
                  {stats?.total_lists ? Math.round((stats.electrical_lists / stats.total_lists) * 100) : 0}%
                </span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${stats?.total_lists ? (stats.electrical_lists / stats.total_lists) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #d97706, #f59e0b)'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#2dd4bf', fontWeight: 700 }}>Plumbing ({stats?.plumbing_lists || 0})</span>
                <span style={{ color: '#94a3b8' }}>
                  {stats?.total_lists ? Math.round((stats.plumbing_lists / stats.total_lists) * 100) : 0}%
                </span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${stats?.total_lists ? (stats.plumbing_lists / stats.total_lists) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0d9488, #14b8a6)'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Shortcut Banner */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
              Item Catalog Database Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Add new materials, update item codes, unit metrics, descriptions, or enable/disable materials for workers in the field.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Link to="/admin/items" className="btn btn-plumb" style={{ width: '100%', justifyContent: 'center' }}>
              <Layers size={16} /> Open Item Catalog Manager
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Users List */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} color="#3b82f6" /> Recent User Registrations
        </h3>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>Username</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Full Name</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Email</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent_users || []).map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    {u.username}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                    {u.first_name ? `${u.first_name} ${u.last_name || ''}` : 'N/A'}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className={`badge ${u.profile?.role === 'plumber' ? 'badge-plumb' : 'badge-elec'}`}>
                      {u.profile?.role || (u.is_staff ? 'admin' : 'worker')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
