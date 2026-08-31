import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListContext } from '../context/ListContext';
import api from '../services/api';
import { downloadPDF } from '../services/pdfService';
import PDFDocument from '../components/PDFDocument';
import { 
  FileText, Search, Plus, Eye, Edit3, 
  Copy, Download, Trash2, AlertTriangle, CheckCircle 
} from 'lucide-react';

const MyLists = () => {
  const { user } = useContext(AuthContext);
  const { loadListForEdit } = useContext(ListContext);
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'electrical' | 'plumbing'

  // Modal States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewList, setPreviewList] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lists/');
      setLists(res.data);
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEdit = (list) => {
    loadListForEdit(list);
    if (list.list_type === 'plumbing') {
      navigate('/plumbing-list');
    } else {
      navigate('/electrical-list');
    }
  };

  const handleDuplicate = async (listId) => {
    try {
      await api.post(`/lists/${listId}/duplicate/`);
      showToast('List duplicated successfully!');
      fetchLists();
    } catch (err) {
      console.error('Failed to duplicate list:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/lists/${deleteTarget.id}/`);
      showToast(`Deleted list for ${deleteTarget.client_name}`);
      setDeleteTarget(null);
      fetchLists();
    } catch (err) {
      console.error('Failed to delete list:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredLists = lists.filter((list) => {
    const matchesSearch =
      list.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.project_name && list.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (list.location && list.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'ALL' || list.list_type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          left: 'auto',
          maxWidth: 'calc(100vw - 40px)',
          background: '#10b981',
          color: '#ffffff',
          padding: '0.75rem 1.15rem',
          borderRadius: '8px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            My Material Lists History
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            View, duplicate, edit, or regenerate A4 PDFs for previous client material requirements.
          </p>
        </div>

        <button onClick={() => navigate('/create-list')} className="btn btn-elec" style={{ width: 'auto' }}>
          <Plus size={16} /> Create New List
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Type Filter Buttons */}
          <div className="category-scroll" style={{ paddingBottom: 0 }}>
            <button
              onClick={() => setFilterType('ALL')}
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flexShrink: 0 }}
            >
              All ({lists.length})
            </button>

            <button
              onClick={() => setFilterType('electrical')}
              className={`btn btn-sm ${filterType === 'electrical' ? 'btn-elec' : 'btn-outline'}`}
              style={{ flexShrink: 0 }}
            >
              Electrical ({lists.filter(l => l.list_type === 'electrical').length})
            </button>

            <button
              onClick={() => setFilterType('plumbing')}
              className={`btn btn-sm ${filterType === 'plumbing' ? 'btn-plumb' : 'btn-outline'}`}
              style={{ flexShrink: 0 }}
            >
              Plumbing ({lists.filter(l => l.list_type === 'plumbing').length})
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client or location..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

        </div>
      </div>

      {/* Material Lists Display */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading material list history...</p>
      ) : filteredLists.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>No Material Lists Found</h3>
          <p style={{ fontSize: '0.825rem', marginTop: '0.2rem', marginBottom: '1rem' }}>
            {searchQuery || filterType !== 'ALL'
              ? 'No lists match your search filter.'
              : 'You haven\'t created any material lists yet.'}
          </p>
          <button onClick={() => navigate('/create-list')} className="btn btn-elec">
            <Plus size={16} /> Create Your First List
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredLists.map((list) => {
            const isPlumb = list.list_type === 'plumbing';
            const totalUnits = (list.items || []).reduce((acc, curr) => acc + parseInt(curr.quantity || 0, 10), 0);

            return (
              <div
                key={list.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  borderLeft: `5px solid ${isPlumb ? '#0d9488' : '#d97706'}`,
                  padding: '1.15rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className={`badge ${isPlumb ? 'badge-plumb' : 'badge-elec'}`}>
                      {list.list_type}
                    </span>
                    <span className="mono" style={{ fontSize: '0.72rem', color: '#64748b', background: '#0f172a', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                      #MRL-{list.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem' }}>
                    {list.client_name}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.65rem' }}>
                    {list.project_name ? `${list.project_name} — ` : ''} {list.location || 'Location Not Specified'}
                  </p>

                  <div style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#cbd5e1'
                  }}>
                    <span>Items: <strong style={{ color: '#fff' }}>{list.items?.length || 0}</strong></span>
                    <span>Units: <strong style={{ color: isPlumb ? '#2dd4bf' : '#fbbf24' }}>{totalUnits}</strong></span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.72rem', color: '#64748b' }}>
                    <span>Date: {list.date}</span>
                    {list.client_phone && <span>{list.client_phone}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <button
                      onClick={() => setPreviewList(list)}
                      className="btn btn-sm btn-outline"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      onClick={() => downloadPDF(list, user)}
                      className={`btn btn-sm ${isPlumb ? 'btn-plumb' : 'btn-elec'}`}
                    >
                      <Download size={13} /> A4 PDF
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleEdit(list)}
                      className="btn btn-sm btn-secondary"
                      style={{ flex: 1 }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => handleDuplicate(list.id)}
                      className="btn btn-sm btn-outline"
                      title="Duplicate for new client"
                    >
                      <Copy size={13} /> Duplicate
                    </button>

                    <button
                      onClick={() => setDeleteTarget(list)}
                      className="btn btn-sm btn-danger"
                      title="Delete List"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PDF Document Preview Modal */}
      {previewList && (
        <PDFDocument
          listData={previewList}
          userProfile={user}
          onClose={() => setPreviewList(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#ef4444' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.15rem', lineHeight: 1.4 }}>
              Permanently delete material list for{' '}
              <strong style={{ color: '#fff' }}>"{deleteTarget.client_name}"</strong>?
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-sm btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btn btn-sm btn-danger"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyLists;
