import React, { useContext, useState } from 'react';
import { ListContext } from '../context/ListContext';
import { AuthContext } from '../context/AuthContext';
import { downloadPDF, printPDFInNewTab } from '../services/pdfService';
import AddItemModal from './AddItemModal';
import { 
  ShoppingBag, Trash2, Edit3, Save, Download, 
  Printer, AlertCircle, Plus, Minus, CheckCircle, X 
} from 'lucide-react';

const ListDrawer = ({ onSaveSuccess, onShowPreview, onClose }) => {
  const {
    listType,
    clientInfo,
    selectedItems,
    updateQuantity,
    removeItem,
    clearList,
    saveListToServer,
    totalItemsCount,
    totalUniqueItems,
    lastAutoSavedAt,
    autoSaveEnabled,
    setAutoSaveEnabled,
  } = useContext(ListContext);

  const { user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const isPlumbing = listType === 'plumbing';

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setSaving(true);
      const savedList = await saveListToServer();
      setSuccessMsg('List saved successfully to database!');
      if (onSaveSuccess) onSaveSuccess(savedList);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save list.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (selectedItems.length === 0) {
      setErrorMsg('Add items to list before generating PDF.');
      return;
    }
    const fullListData = {
      list_type: listType,
      client_name: clientInfo.client_name || 'Client',
      client_phone: clientInfo.client_phone,
      project_name: clientInfo.project_name,
      location: clientInfo.location,
      date: clientInfo.date,
      notes: clientInfo.notes,
      items: selectedItems,
    };
    downloadPDF(fullListData, user);
  };

  const handlePrintPDF = () => {
    if (selectedItems.length === 0) {
      setErrorMsg('Add items to list before printing PDF.');
      return;
    }
    const fullListData = {
      list_type: listType,
      client_name: clientInfo.client_name || 'Client',
      client_phone: clientInfo.client_phone,
      project_name: clientInfo.project_name,
      location: clientInfo.location,
      date: clientInfo.date,
      notes: clientInfo.notes,
      items: selectedItems,
    };
    printPDFInNewTab(fullListData, user);
  };

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderTop: `4px solid ${isPlumbing ? '#0d9488' : '#d97706'}`,
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '0.85rem', 
        paddingBottom: '0.65rem', 
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={20} color={isPlumbing ? '#2dd4bf' : '#fbbf24'} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Current {isPlumbing ? 'Plumbing' : 'Electrical'} List
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowAddItemModal(true)}
            className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem' }}
            title="Add custom item to list"
          >
            <Plus size={13} strokeWidth={2.5} /> Custom Item
          </button>
          <span className={`badge ${isPlumbing ? 'badge-plumb' : 'badge-elec'}`}>
            {totalUniqueItems} items ({totalItemsCount} units)
          </span>
          {onClose && (
            <button 
              onClick={onClose} 
              className="btn btn-sm btn-outline" 
              style={{ padding: '0.25rem', minWidth: '32px', minHeight: '32px' }}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Auto-Save Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '6px',
        padding: '0.25rem 0.55rem',
        marginBottom: '0.75rem',
        fontSize: '0.72rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: autoSaveEnabled ? '#10b981' : '#64748b',
            boxShadow: autoSaveEnabled ? '0 0 6px #10b981' : 'none',
            flexShrink: 0
          }} />
          <span>
            {autoSaveEnabled 
              ? (lastAutoSavedAt ? `Auto-saved (${lastAutoSavedAt})` : 'Auto-save Active on page switch') 
              : 'Auto-save Paused'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          style={{
            background: 'none',
            border: 'none',
            color: autoSaveEnabled ? '#38bdf8' : '#94a3b8',
            fontSize: '0.68rem',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline'
          }}
        >
          {autoSaveEnabled ? 'Auto-Save: ON' : 'Turn ON'}
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.625rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.825rem',
          marginBottom: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '0.625rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.825rem',
          marginBottom: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Items Scrollable List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        maxHeight: '380px', 
        minHeight: '160px',
        paddingRight: '0.25rem', 
        marginBottom: '1rem' 
      }}>
        {selectedItems.length === 0 ? (
          <div style={{ textTransform: 'none', textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <ShoppingBag size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>No items added yet</p>
            <p style={{ fontSize: '0.78rem', marginTop: '0.25rem', marginBottom: '0.85rem' }}>
              Select materials from catalog or add custom materials.
            </p>
            <button
              type="button"
              onClick={() => setShowAddItemModal(true)}
              className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
              style={{ gap: '0.35rem', margin: '0 auto', fontSize: '0.78rem' }}
            >
              <Plus size={14} strokeWidth={2.5} /> Add Custom Item
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.65rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>#{idx + 1}</span>
                    <span style={{ 
                      fontSize: '0.825rem', 
                      fontWeight: 700, 
                      color: '#f8fafc', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}>
                      {item.item_name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
                    {item.category || 'General'}
                  </div>
                </div>

                {/* Quantity Stepper in Drawer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  <div className="quantity-stepper" style={{ height: '30px' }}>
                    <button
                      onClick={() => updateQuantity(item.item_name, item.quantity - 1)}
                      className="quantity-btn"
                      style={{ width: '26px', height: '28px', minWidth: '26px' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.item_name, e.target.value)}
                      className="quantity-input"
                      style={{ width: '34px', height: '28px', fontSize: '0.8rem' }}
                      aria-label="Item quantity"
                    />
                    <button
                      onClick={() => updateQuantity(item.item_name, item.quantity + 1)}
                      className="quantity-btn"
                      style={{ width: '26px', height: '28px', minWidth: '26px' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: isPlumbing ? '#2dd4bf' : '#fbbf24', fontWeight: 600, minWidth: '28px', textAlign: 'center' }}>
                    {item.unit}
                  </span>

                  <button
                    onClick={() => removeItem(item.item_name)}
                    style={{ color: '#ef4444', padding: '0.3rem', opacity: 0.85, display: 'flex', alignItems: 'center' }}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer & Action Buttons */}
      <div style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        paddingTop: '0.85rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
          <span>Requirement:</span>
          <span style={{ color: isPlumbing ? '#2dd4bf' : '#fbbf24' }}>
            {totalUniqueItems} Items ({totalItemsCount} Units)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
          <button
            onClick={handleSave}
            disabled={saving || selectedItems.length === 0}
            className="btn btn-sm btn-primary"
            style={{ opacity: saving || selectedItems.length === 0 ? 0.6 : 1 }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save List'}
          </button>

          {onShowPreview && (
            <button
              onClick={onShowPreview}
              disabled={selectedItems.length === 0}
              className="btn btn-sm btn-outline"
            >
              <Edit3 size={15} />
              Preview PDF
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={selectedItems.length === 0}
            className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
          >
            <Download size={15} />
            PDF Download
          </button>

          <button
            onClick={handlePrintPDF}
            disabled={selectedItems.length === 0}
            className="btn btn-sm btn-secondary"
          >
            <Printer size={15} />
            Print A4
          </button>
        </div>

        {selectedItems.length > 0 && (
          <button
            onClick={clearList}
            className="btn btn-sm btn-outline"
            style={{ color: '#94a3b8', marginTop: '0.15rem', border: 'none', padding: '0.3rem' }}
          >
            <Trash2 size={13} /> Clear All Items
          </button>
        )}
      </div>

      {/* Add Custom Item Modal */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        defaultType={listType}
      />
    </div>
  );
};

export default ListDrawer;
