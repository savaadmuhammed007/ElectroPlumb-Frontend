import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListContext } from '../context/ListContext';
import api from '../services/api';
import { 
  Zap, Wrench, PlusCircle, FileText, User, 
  Clock, ArrowRight, Eye, Printer 
} from 'lucide-react';
import { downloadPDF } from '../services/pdfService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { loadListForEdit } = useContext(ListContext);
  const navigate = useNavigate();

  const [recentLists, setRecentLists] = useState([]);
  const [stats, setStats] = useState({ total: 0, electrical: 0, plumbing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lists/');
      const lists = res.data;
      setRecentLists(lists.slice(0, 5));

      const elecCount = lists.filter((l) => l.list_type === 'electrical').length;
      const plumbCount = lists.filter((l) => l.list_type === 'plumbing').length;
      setStats({
        total: lists.length,
        electrical: elecCount,
        plumbing: plumbCount,
      });
    } catch (err) {
      console.error('Failed to load dashboard lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditList = (list) => {
    loadListForEdit(list);
    if (list.list_type === 'plumbing') {
      navigate('/plumbing-list');
    } else {
      navigate('/electrical-list');
    }
  };

  const { businessProfile } = useContext(AuthContext);
  const companyTitle = businessProfile?.business_name || 'ElectroPlumb Material Manager';

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      
      {/* Welcome Banner Box */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderLeft: '6px solid #2563eb',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-elec">
              Instant Access
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {businessProfile?.technician_name || 'Electrical & Plumbing'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0' }}>
            {companyTitle}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
            Select a trade below to create, manage, and print professional A4 material requirement lists.
          </p>
        </div>

        {/* Primary Trade Creation Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/electrical-list" className="btn btn-elec" style={{ boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)', padding: '0.75rem 1.25rem' }}>
            <Zap size={18} />
            Create Electrical List
          </Link>
          <Link to="/plumbing-list" className="btn btn-plumb" style={{ boxShadow: '0 4px 16px rgba(20, 184, 166, 0.35)', padding: '0.75rem 1.25rem' }}>
            <Wrench size={18} />
            Create Plumbing List
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Electrical Dedicated Page */}
        <Link 
          to="/electrical-list"
          className="glass-card"
          style={{ borderTop: '4px solid #d97706', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Zap size={22} />
            </div>
            <span className="badge badge-elec">Electrical Trade</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Electrical Material List
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            Wires, MCBs, Modular switches, conduits & DB boxes.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#fbbf24', fontWeight: 700 }}>
            Open Electrical Builder <ArrowRight size={15} />
          </div>
        </Link>

        {/* Card 2: Plumbing Dedicated Page */}
        <Link 
          to="/plumbing-list"
          className="glass-card"
          style={{ borderTop: '4px solid #0d9488', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf' }}>
              <Wrench size={22} />
            </div>
            <span className="badge badge-plumb">Plumbing Trade</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Plumbing Material List
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            CPVC/PVC pipes, fittings, valves, taps, showers & traps.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#2dd4bf', fontWeight: 700 }}>
            Open Plumbing Builder <ArrowRight size={15} />
          </div>
        </Link>

        {/* Card 3: My Saved Lists */}
        <Link to="/my-lists" className="glass-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <FileText size={22} />
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              {stats.total} Total
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            My Saved Lists
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            View list history, duplicate lists, or re-print A4 sheets.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#60a5fa', fontWeight: 700 }}>
            Browse History <ArrowRight size={15} />
          </div>
        </Link>

        {/* Card 4: My Profile */}
        <Link to="/profile" className="glass-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              <User size={22} />
            </div>
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              Profile
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            My Business Profile
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            Manage phone, address, and branding shown on A4 PDFs.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#c084fc', fontWeight: 700 }}>
            Edit Profile <ArrowRight size={15} />
          </div>
        </Link>

      </div>

      {/* Statistics Overview Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Total Lists</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
            {stats.total}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Electrical Lists</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
            {stats.electrical}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 600 }}>Plumbing Lists</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2dd4bf', marginTop: '0.2rem' }}>
            {stats.plumbing}
          </div>
        </div>
      </div>

      {/* Recent Lists History Section */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Recent Material Lists
            </h3>
          </div>
          <Link to="/my-lists" className="btn btn-sm btn-outline">
            View All ({stats.total})
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading recent lists...</p>
        ) : recentLists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>No material lists created yet</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              <Link to="/electrical-list" className="btn btn-sm btn-elec">
                <Zap size={14} /> Electrical List
              </Link>
              <Link to="/plumbing-list" className="btn btn-sm btn-plumb">
                <Wrench size={14} /> Plumbing List
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="desktop-recent-table table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Client Name</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Type</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Location / Project</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Items</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLists.map((list) => (
                    <tr key={list.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                        {list.client_name}
                        {list.client_phone && (
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                            {list.client_phone}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span className={`badge ${list.list_type === 'plumbing' ? 'badge-plumb' : 'badge-elec'}`}>
                          {list.list_type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: '#cbd5e1' }}>
                        {list.location || list.project_name || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: '#94a3b8' }}>
                        {list.date}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                        {list.items?.length || 0}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditList(list)}
                            className="btn btn-sm btn-outline"
                            title="View / Edit List"
                          >
                            <Eye size={13} /> Edit
                          </button>
                          <button
                            onClick={() => downloadPDF(list, user)}
                            className={`btn btn-sm ${list.list_type === 'plumbing' ? 'btn-plumb' : 'btn-elec'}`}
                            title="Generate PDF"
                          >
                            <Printer size={13} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-recent-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLists.map((list) => (
                <div 
                  key={list.id} 
                  style={{ 
                    background: '#0f172a', 
                    border: '1px solid #334155', 
                    borderLeft: `4px solid ${list.list_type === 'plumbing' ? '#0d9488' : '#d97706'}`,
                    borderRadius: '8px', 
                    padding: '0.85rem' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{list.client_name}</h4>
                      {list.project_name && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{list.project_name}</span>}
                    </div>
                    <span className={`badge ${list.list_type === 'plumbing' ? 'badge-plumb' : 'badge-elec'}`}>
                      {list.list_type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0' }}>
                    <span>{list.date || 'No date'}</span>
                    <span style={{ fontWeight: 700, color: '#cbd5e1' }}>{list.items?.length || 0} items</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => handleEditList(list)}
                      className="btn btn-sm btn-outline"
                      style={{ justifyContent: 'center' }}
                    >
                      <Eye size={14} /> Edit List
                    </button>
                    <button
                      onClick={() => downloadPDF(list, user)}
                      className={`btn btn-sm ${list.list_type === 'plumbing' ? 'btn-plumb' : 'btn-elec'}`}
                      style={{ justifyContent: 'center' }}
                    >
                      <Printer size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-recent-table { display: none !important; }
          .mobile-recent-cards { display: flex !important; }
        }
      `}</style>

    </div>
  );
};

export default Dashboard;
