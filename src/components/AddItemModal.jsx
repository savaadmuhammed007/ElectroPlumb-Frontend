import React, { useState, useEffect, useContext } from 'react';
import { ListContext } from '../context/ListContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  X, Plus, Zap, Wrench, Package, Hash, 
  Layers, Tag, AlignLeft, Check, AlertCircle, Sparkles 
} from 'lucide-react';

const UNIT_PRESETS = [
  'Piece', 'Meter', 'Box', 'Packet', 'Coil', 
  'Roll', 'Length', 'Set', 'Kg', 'Feet', 'Pair', 'Bundle', 'Other'
];

const ELECTRICAL_DEFAULT_CATS = [
  'Wires & Cables', 'Switches & Sockets', 'MCBs & DB Boxes', 
  'Conduits & Fittings', 'Lighting & LED', 'Accessories', 'Tools & Safety'
];

const PLUMBING_DEFAULT_CATS = [
  'Pipes (CPVC/PVC)', 'Fittings & Elbows', 'Valves & Taps', 
  'Sanitary & Drainage', 'Showers & Mixers', 'Adhesives & Sealants', 'Accessories'
];

const AddItemModal = ({
  isOpen,
  onClose,
  defaultType = 'electrical',
  initialQuery = '',
  existingCategories = [],
  onItemCreated = null,
}) => {
  const { addItem } = useContext(ListContext);
  const { user } = useContext(AuthContext);

  const [itemType, setItemType] = useState(defaultType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [customUnit, setCustomUnit] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [saveToCatalog, setSaveToCatalog] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      setItemType(defaultType);
      setName(initialQuery.trim());
      setError(null);
      setSuccessNotice(null);
      setQuantity(1);
      setDescription('');
      setSaveToCatalog(true);

      const defaultCats = defaultType === 'plumbing' ? PLUMBING_DEFAULT_CATS : ELECTRICAL_DEFAULT_CATS;
      const validCats = [...new Set([...defaultCats, ...existingCategories.filter(c => c && c !== 'ALL')])];
      setCategory(validCats[0] || 'General');
      setCustomCategory('');
      setUnit('Piece');
      setCustomUnit('');
    }
  }, [isOpen, defaultType, initialQuery]);

  if (!isOpen) return null;

  const isPlumbing = itemType === 'plumbing';

  // Compute category options list
  const defaultCats = isPlumbing ? PLUMBING_DEFAULT_CATS : ELECTRICAL_DEFAULT_CATS;
  const allCategoryOptions = [
    ...new Set([...defaultCats, ...existingCategories.filter(c => c && c !== 'ALL')]),
    'Custom / Other...'
  ];

  const handleTypeToggle = (type) => {
    setItemType(type);
    const newDefaults = type === 'plumbing' ? PLUMBING_DEFAULT_CATS : ELECTRICAL_DEFAULT_CATS;
    setCategory(newDefaults[0] || 'General');
  };

  const handleAdd = async (keepOpen = false) => {
    setError(null);
    setSuccessNotice(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter an Item Name.');
      return;
    }

    const finalCategory = (category === 'Custom / Other...' ? customCategory.trim() : category.trim()) || 'General';
    const finalUnit = (unit === 'Other' ? customUnit.trim() : unit.trim()) || 'Piece';
    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    setLoading(true);
    let createdCatalogItem = null;

    if (saveToCatalog) {
      try {
        // Auto-generate a clean item code: e.g. ELE-7492 or PLM-1843
        const prefix = isPlumbing ? 'PLM' : 'ELE';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const nameSlug = trimmedName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const generatedCode = `${prefix}-${nameSlug ? nameSlug + '-' : ''}${randomNum}`;

        const payload = {
          name: trimmedName,
          item_code: generatedCode,
          item_type: itemType,
          category: finalCategory,
          unit: finalUnit,
          description: description.trim(),
          status: 'active'
        };

        const res = await api.post('/items/', payload);
        createdCatalogItem = res.data;
      } catch (err) {
        console.warn('Failed to save directly to catalog API:', err);
        // Continue adding to active list even if backend catalog save failed (e.g., duplicate code or offline)
      }
    }

    // Add item to active list in context
    addItem(
      {
        id: createdCatalogItem ? createdCatalogItem.id : null,
        name: trimmedName,
        category: finalCategory,
        unit: finalUnit,
      },
      parsedQty
    );

    if (onItemCreated && createdCatalogItem) {
      onItemCreated(createdCatalogItem);
    }

    setLoading(false);

    if (keepOpen) {
      setSuccessNotice(`Added "${trimmedName}" (${parsedQty} ${finalUnit})! Add another item below:`);
      setName('');
      setDescription('');
      setQuantity(1);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, padding: '1rem' }} onClick={onClose}>
      <div 
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '540px', 
          width: '100%', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          border: `1px solid ${isPlumbing ? 'rgba(20, 184, 166, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          boxShadow: isPlumbing ? '0 15px 40px rgba(13, 148, 136, 0.25)' : '0 15px 40px rgba(217, 119, 6, 0.25)',
          padding: '1.35rem',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isPlumbing ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Add New Material Item
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Quickly add custom materials directly to your active list
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-ghost" 
            style={{ padding: '0.4rem', color: '#94a3b8', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#34d399',
            fontSize: '0.82rem'
          }}>
            <Check size={16} flexShrink={0} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#f87171',
            fontSize: '0.82rem'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {/* Trade Type Selection */}
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ marginBottom: '0.4rem' }}>
            <Layers size={13} /> Trade Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleTypeToggle('electrical')}
              className={`btn btn-sm ${!isPlumbing ? 'btn-elec' : 'btn-outline'}`}
              style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.55rem' }}
            >
              <Zap size={15} /> Electrical
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('plumbing')}
              className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-outline'}`}
              style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.55rem' }}
            >
              <Wrench size={15} /> Plumbing
            </button>
          </div>
        </div>

        {/* Item Name Input */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            <Package size={13} /> Item / Material Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isPlumbing ? "e.g. Astral CPVC 1 inch Elbow 90°" : "e.g. Havells 2.5 sq mm Wire Red (90m)"}
            className="form-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(false);
              }
            }}
          />
        </div>

        {/* Category & Unit Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          {/* Category */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><Tag size={13} /> Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {allCategoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {category === 'Custom / Other...' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type custom category..."
                className="form-input"
                style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
              />
            )}
          </div>

          {/* Unit */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><Hash size={13} /> Unit of Measurement</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="form-select"
            >
              {UNIT_PRESETS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {unit === 'Other' && (
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Custom unit (e.g. Jar)..."
                className="form-input"
                style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
              />
            )}
          </div>
        </div>

        {/* Quantity Stepper Input */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label"><Hash size={13} /> Initial Quantity</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setQuantity(prev => Math.max(1, (parseInt(prev, 10) || 1) - 1))}
              className="btn btn-outline btn-sm"
              style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="form-input"
              style={{ textAlign: 'center', fontWeight: 700, width: '100px', height: '36px' }}
            />
            <button
              type="button"
              onClick={() => setQuantity(prev => (parseInt(prev, 10) || 1) + 1)}
              className="btn btn-outline btn-sm"
              style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
            >
              +
            </button>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
              {unit === 'Other' ? customUnit || 'units' : unit}
            </span>
          </div>
        </div>

        {/* Optional Description / Specifications */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label"><AlignLeft size={13} /> Description / Specs (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Schedule 80 heavy duty, ISI certified"
            className="form-input"
            style={{ fontSize: '0.825rem' }}
          />
        </div>

        {/* Save to Catalog Checkbox */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.75rem 0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          cursor: 'pointer'
        }} onClick={() => setSaveToCatalog(!saveToCatalog)}>
          <input
            type="checkbox"
            checked={saveToCatalog}
            onChange={(e) => setSaveToCatalog(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: isPlumbing ? '#0d9488' : '#d97706' }}
            onClick={(e) => e.stopPropagation()}
          />
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color={isPlumbing ? '#2dd4bf' : '#fbbf24'} />
              Save to material catalog
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Makes this item permanently searchable and reusable for future lists.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAdd(true)}
            className="btn btn-outline btn-sm"
            disabled={loading || !name.trim()}
            style={{ borderColor: isPlumbing ? '#0d9488' : '#d97706', color: isPlumbing ? '#2dd4bf' : '#fbbf24' }}
          >
            Add & Add Another
          </button>
          <button
            type="button"
            onClick={() => handleAdd(false)}
            className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
            disabled={loading || !name.trim()}
            style={{ minWidth: '130px', justifyContent: 'center' }}
          >
            {loading ? 'Adding...' : (
              <>
                <Check size={16} /> Add to List
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddItemModal;
