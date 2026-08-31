import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Zap, Wrench, Plus, Search, Edit, 
  Trash2, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle, X,
  Upload, FileSpreadsheet, FileCode, RefreshCw, UploadCloud 
} from 'lucide-react';
import GoogleSheetSyncModal from '../components/GoogleSheetSyncModal';
import { 
  getStoredSheetUrl, getStoredWebhookUrl, 
  pushSingleItemToGoogleSheet, pushAllItemsToGoogleSheet 
} from '../services/googleSheetsCatalogService';

const AdminItems = () => {
  const [activeTab, setActiveTab] = useState('electrical'); // 'electrical' | 'plumbing'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearScope, setClearScope] = useState('all'); // 'current' | 'all'
  const [syncToSheet, setSyncToSheet] = useState(true);
  const [pushingAll, setPushingAll] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Import State
  const [importFile, setImportFile] = useState(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState('csv'); // 'csv' | 'json'
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    item_code: '',
    item_type: 'electrical',
    category: '',
    unit: 'Piece',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/items/?item_type=${activeTab}&status=all`);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load catalog items:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearCatalog = async () => {
    try {
      const res = await api.post('/admin/items/clear/', {
        item_type: clearScope === 'current' ? activeTab : 'all'
      });
      showToast(res.data.message || 'Catalog cleared successfully.');
      setShowClearModal(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to clear catalog:', err);
      alert('Failed to clear catalog materials.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const prefix = activeTab === 'electrical' ? 'ELE' : 'PLM';
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: '',
      item_code: `${prefix}-CUSTOM-${randomNum}`,
      item_type: activeTab,
      category: activeTab === 'electrical' ? 'Wires & Cables' : 'Pipes',
      unit: 'Piece',
      description: '',
      status: 'active',
    });
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      item_code: item.item_code,
      item_type: item.item_type,
      category: item.category,
      unit: item.unit,
      description: item.description || '',
      status: item.status,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem.id}/`, formData);
        showToast('Updated item in database!');
      } else {
        await api.post('/items/', formData);
        showToast('Created new item in database!');
      }

      // Live push to Google Sheet if toggle is active
      const webhookUrl = getStoredWebhookUrl();
      if (syncToSheet && webhookUrl) {
        try {
          await pushSingleItemToGoogleSheet(webhookUrl, formData);
          showToast(`Saved to DB & synced "${formData.name}" to Google Sheet!`);
        } catch (sheetErr) {
          console.warn('Google Sheet push failed:', sheetErr);
          showToast('Item saved in database (Google Sheet sync failed).');
        }
      }

      setShowItemModal(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Error saving item. Ensure item code is unique.');
    }
  };

  const handlePushAllToSheet = async () => {
    const webhookUrl = getStoredWebhookUrl();
    if (!webhookUrl) {
      setShowGoogleSheetModal(true);
      return;
    }

    setPushingAll(true);
    try {
      const data = await pushAllItemsToGoogleSheet(webhookUrl, items);
      showToast(data.message || `Successfully synced all ${items.length} items to Google Sheet!`);
    } catch (err) {
      console.error('Push all to sheet failed:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to sync to Google Sheet.';
      alert(errMsg);
    } finally {
      setPushingAll(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/items/${item.id}/`, { ...item, status: newStatus });
      showToast(`Item ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      fetchItems();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/items/${deleteTarget.id}/`);
      showToast(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // EXPORT FUNCTION
  const handleExport = async (format) => {
    try {
      const res = await api.get(`/admin/items/export/?format=${format}&item_type=${activeTab}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `materials_${activeTab}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`Exported ${activeTab} items as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export items.');
    }
  };

  // DOWNLOAD TEMPLATE
  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/admin/items/template/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'materials_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Downloaded sample CSV template');
    } catch (err) {
      console.error('Template download failed:', err);
    }
  };

  // IMPORT SUBMIT FUNCTION
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportResult(null);
    setImporting(true);

    try {
      let res;
      if (importMode === 'csv') {
        if (!importFile) {
          alert('Please choose a CSV file to import.');
          setImporting(false);
          return;
        }
        const formDataPayload = new FormData();
        formDataPayload.append('file', importFile);
        res = await api.post('/admin/items/import/', formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!importJsonText.trim()) {
          alert('Please enter valid JSON text array.');
          setImporting(false);
          return;
        }
        const jsonParsed = JSON.parse(importJsonText);
        res = await api.post('/admin/items/import/', jsonParsed);
      }

      setImportResult(res.data);
      showToast(`Imported: ${res.data.created} created, ${res.data.updated} updated`);
      fetchItems();
    } catch (err) {
      console.error('Import error:', err);
      alert(err.response?.data?.error || 'Failed to import materials.');
    } finally {
      setImporting(false);
    }
  };

  const categories = ['ALL', ...new Set(items.map((i) => i.category))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const isPlumbing = activeTab === 'plumbing';

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
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
            Material Catalog Manager
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Manage predefined Electrical and Plumbing item database with bulk import/export capabilities.
          </p>
        </div>

        {/* Action Buttons: Google Sheets, Sync All, Add, Import, Export */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowGoogleSheetModal(true)} 
            className="btn btn-sm"
            style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
              color: '#ffffff', 
              borderColor: '#10b981',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
            }}
            title="Link and Synchronize with Google Sheets"
          >
            <FileSpreadsheet size={15} /> Google Sheets
          </button>

          <button 
            onClick={handlePushAllToSheet} 
            disabled={pushingAll || items.length === 0}
            className="btn btn-sm"
            style={{ 
              background: 'linear-gradient(135deg, #047857 0%, #059669 100%)', 
              color: '#ffffff', 
              borderColor: '#059669',
              fontWeight: 600
            }}
            title="Sync all catalog items to linked Google Sheet"
          >
            <UploadCloud size={15} className={pushingAll ? 'animate-spin' : ''} /> 
            {pushingAll ? 'Syncing...' : `Sync All to Sheet (${items.length})`}
          </button>

          <button onClick={() => { setShowImportModal(true); setImportResult(null); }} className="btn btn-sm btn-outline">
            <Upload size={14} /> Import
          </button>

          <button onClick={() => handleExport('csv')} className="btn btn-sm btn-secondary" title="Export to CSV">
            <FileSpreadsheet size={14} /> CSV
          </button>

          <button onClick={() => handleExport('json')} className="btn btn-sm btn-secondary" title="Export to JSON">
            <FileCode size={14} /> JSON
          </button>

          <button onClick={() => setShowClearModal(true)} className="btn btn-sm btn-danger" title="Clear all materials from catalog">
            <Trash2 size={14} /> Clear Catalog
          </button>

          <button onClick={handleOpenAddModal} className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}>
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => { setActiveTab('electrical'); setSelectedCategory('ALL'); }}
          className={`btn ${activeTab === 'electrical' ? 'btn-elec' : 'btn-outline'}`}
          style={{ justifyContent: 'center', padding: '0.85rem' }}
        >
          <Zap size={18} /> Electrical Catalog ({activeTab === 'electrical' ? items.length : ''})
        </button>

        <button
          onClick={() => { setActiveTab('plumbing'); setSelectedCategory('ALL'); }}
          className={`btn ${activeTab === 'plumbing' ? 'btn-plumb' : 'btn-outline'}`}
          style={{ justifyContent: 'center', padding: '0.85rem' }}
        >
          <Wrench size={18} /> Plumbing Catalog ({activeTab === 'plumbing' ? items.length : ''})
        </button>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Category Filter Pills */}
          <div className="category-scroll" style={{ paddingBottom: 0 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? (isPlumbing ? 'btn-plumb' : 'btn-elec') : 'btn-outline'}`}
                style={{ borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, padding: '0.35rem 0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item name or code..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

        </div>
      </div>

      {/* Items Table / Cards Section */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading catalog items...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(51, 65, 85, 0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: '#64748b' }}>
              <FileSpreadsheet size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
              No {activeTab} materials in catalog
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
              The catalog is currently empty. You can sync materials from your Google Sheet, import a CSV, or add items manually.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowGoogleSheetModal(true)} 
                className="btn btn-sm" 
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700 }}
              >
                <FileSpreadsheet size={15} /> Sync From Google Sheet
              </button>
              <button onClick={() => { setShowImportModal(true); setImportResult(null); }} className="btn btn-sm btn-outline">
                <Upload size={14} /> Import CSV
              </button>
              <button onClick={handleOpenAddModal} className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}>
                <Plus size={15} /> Add First Item
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="desktop-items-table table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Code</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Item Name</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Category</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Unit</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: item.status === 'disabled' ? 0.6 : 1 }}>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span className="mono" style={{ fontSize: '0.72rem', color: '#64748b', background: '#0f172a', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {item.item_code}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.name}
                        {item.description && (
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span className={`badge ${isPlumbing ? 'badge-plumb' : 'badge-elec'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                        {item.unit}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-disabled'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="btn btn-sm btn-outline"
                            title={item.status === 'active' ? 'Disable Item' : 'Enable Item'}
                          >
                            {item.status === 'active' ? <ToggleRight size={18} color="#34d399" /> : <ToggleLeft size={18} color="#94a3b8" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-sm btn-secondary"
                            title="Edit Item"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="btn btn-sm btn-danger"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-items-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    background: '#0f172a', 
                    border: '1px solid #334155', 
                    borderLeft: `4px solid ${isPlumbing ? '#0d9488' : '#d97706'}`,
                    borderRadius: '8px', 
                    padding: '0.85rem',
                    opacity: item.status === 'disabled' ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <span className="mono" style={{ fontSize: '0.7rem', color: '#64748b', background: '#1e293b', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        {item.item_code}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>{item.name}</h4>
                    </div>
                    <span className={`badge ${item.status === 'active' ? 'badge-active' : 'badge-disabled'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: '0.4rem 0' }}>
                    <span className={`badge ${isPlumbing ? 'badge-plumb' : 'badge-elec'}`}>{item.category}</span>
                    <span>Unit: <strong style={{ color: '#cbd5e1' }}>{item.unit}</strong></span>
                  </div>

                  {item.description && (
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{item.description}</p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="btn btn-sm btn-outline"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem' }}
                    >
                      {item.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="btn btn-sm btn-secondary"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem' }}
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="btn btn-sm btn-danger"
                      style={{ padding: '0.35rem 0.6rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Import Materials</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <strong>Need sample CSV?</strong>
                <button onClick={handleDownloadTemplate} className="btn btn-sm btn-outline" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}>
                  Download CSV Template
                </button>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                Columns: <code>item_code</code>, <code>name</code>, <code>item_type</code>, <code>category</code>, <code>unit</code>, <code>description</code>, <code>status</code>.
              </p>
            </div>

            {/* Import Mode Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setImportMode('csv')}
                className={`btn btn-sm ${importMode === 'csv' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
              >
                Upload CSV
              </button>
              <button
                type="button"
                onClick={() => setImportMode('json')}
                className={`btn btn-sm ${importMode === 'json' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
              >
                Paste JSON
              </button>
            </div>

            <form onSubmit={handleImportSubmit}>
              {importMode === 'csv' ? (
                <div className="form-group">
                  <label className="form-label">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="form-input"
                    style={{ padding: '0.5rem' }}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">JSON Data</label>
                  <textarea
                    rows="5"
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='[&#10;  { "item_code": "ELE-99", "name": "4mm Wire", "item_type": "electrical", "category": "Wires", "unit": "Meter" }&#10;]'
                    className="form-textarea mono"
                    style={{ fontSize: '0.78rem' }}
                  />
                </div>
              )}

              {importResult && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  marginBottom: '1rem'
                }}>
                  <strong>Summary:</strong> {importResult.created} created, {importResult.updated} updated.
                  {importResult.errors?.length > 0 && (
                    <div style={{ color: '#fca5a5', marginTop: '0.25rem' }}>
                      Errors: {importResult.errors.join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowImportModal(false)} className="btn btn-sm btn-outline">
                  Close
                </button>
                <button type="submit" disabled={importing} className="btn btn-sm btn-primary">
                  {importing ? 'Processing...' : 'Run Bulk Import'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingItem ? 'Edit Material Item' : 'Add New Material Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. CPVC Ball Valve 1 inch"
                  className="form-input"
                />
              </div>

              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.item_code}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                    className="form-input mono"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Valves"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Unit Metric</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="form-select"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Meter">Meter</option>
                    <option value="Length">Length (3m)</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                    <option value="Roll">Roll</option>
                    <option value="Set">Set</option>
                    <option value="Can">Can</option>
                    <option value="Tube">Tube</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Material specs or brand details..."
                  className="form-textarea"
                />
              </div>

              {/* Live Sync to Google Sheet Checkbox */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileSpreadsheet size={16} color="#10b981" />
                  <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>
                    Google Sheet Sync
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#a7f3d0', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={syncToSheet}
                    onChange={(e) => setSyncToSheet(e.target.checked)}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Live sync on save</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn btn-sm btn-outline">
                  Cancel
                </button>
                <button type="submit" className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}>
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Sync Modal */}
      {showGoogleSheetModal && (
        <GoogleSheetSyncModal
          items={items}
          onClose={() => setShowGoogleSheetModal(false)}
          onSyncSuccess={() => {
            fetchItems();
            showToast('Google Sheet catalog sync completed!');
          }}
        />
      )}

      {/* Clear Catalog Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#ef4444' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Clear Catalog Materials</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: 1.5 }}>
              Choose whether to clear only the currently active tab materials or remove all materials across both Electrical and Plumbing:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="clearScope"
                  value="current"
                  checked={clearScope === 'current'}
                  onChange={() => setClearScope('current')}
                />
                Clear only <strong>{activeTab}</strong> items
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="clearScope"
                  value="all"
                  checked={clearScope === 'all'}
                  onChange={() => setClearScope('all')}
                />
                Clear <strong>ALL</strong> materials (Electrical & Plumbing)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowClearModal(false)} className="btn btn-sm btn-outline">
                Cancel
              </button>
              <button onClick={handleClearCatalog} className="btn btn-sm btn-danger">
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#ef4444' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Confirm Delete</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.15rem' }}>
              Are you sure you want to delete material <strong style={{ color: '#fff' }}>"{deleteTarget.name}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-sm btn-outline">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-sm btn-danger">
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-items-table { display: none !important; }
          .mobile-items-cards { display: flex !important; }
        }
      `}</style>

    </div>
  );
};

export default AdminItems;
