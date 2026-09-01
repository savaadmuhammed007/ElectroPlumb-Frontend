import React, { useContext, useEffect, useState } from 'react';
import { ListContext } from '../context/ListContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import ListDrawer from '../components/ListDrawer';
import PDFDocument from '../components/PDFDocument';
import AddItemModal from '../components/AddItemModal';
import { 
  Zap, Wrench, Search, UserCheck, Calendar, 
  MapPin, Phone, FileText, ShoppingBag, ChevronRight, Plus 
} from 'lucide-react';

const CreateList = () => {
  const {
    editingId,
    listType,
    setListType,
    clientInfo,
    setClientInfo,
    selectedItems,
    addItem,
    totalUniqueItems,
    totalItemsCount,
  } = useContext(ListContext);

  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCatalogItems();
  }, [listType]);

  const fetchCatalogItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/items/?item_type=${listType}`);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (e) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  // Categories list extraction
  const categories = ['ALL', ...new Set(items.map((i) => i.category))];

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getAddedQuantity = (itemName) => {
    const found = selectedItems.find((i) => i.item_name === itemName);
    return found ? found.quantity : 0;
  };

  const isPlumbing = listType === 'plumbing';

  return (
    <div className="container" style={{ padding: '1.25rem 0.75rem', paddingBottom: '5.5rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Banner & Trade Selection */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1.15rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: isPlumbing ? '#2dd4bf' : '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STEP 1: SELECT TRADE CATEGORY
            </span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
              {editingId ? 'Edit Material List' : 'Create Material List'}
            </h1>
          </div>

          <span className={`badge ${isPlumbing ? 'badge-plumb' : 'badge-elec'}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
            {isPlumbing ? 'Plumbing Materials' : 'Electrical Materials'}
          </span>
        </div>

        {/* List Type Option Cards */}
        <div className="trade-cards-grid">
          <div
            onClick={() => setListType('electrical')}
            className={`trade-card-option ${!isPlumbing ? 'active-elec' : ''}`}
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              border: `2px solid ${!isPlumbing ? '#d97706' : '#334155'}`,
              background: !isPlumbing ? 'rgba(245, 158, 11, 0.12)' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: !isPlumbing ? '#d97706' : '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Electrical Materials
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.15rem 0 0 0', lineHeight: 1.3 }}>
                Wires, Switches, MCBs, DBs, Conduits, LED Lights
              </p>
            </div>
          </div>

          <div
            onClick={() => setListType('plumbing')}
            className={`trade-card-option ${isPlumbing ? 'active-plumb' : ''}`}
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              border: `2px solid ${isPlumbing ? '#0d9488' : '#334155'}`,
              background: isPlumbing ? 'rgba(20, 184, 166, 0.12)' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isPlumbing ? '#0d9488' : '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Wrench size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Plumbing Materials
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.15rem 0 0 0', lineHeight: 1.3 }}>
                CPVC/PVC Pipes, Fittings, Valves, Taps, Traps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Client Info + Item Catalog (Left) & Active Drawer (Right) */}
      <div className="create-layout-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          
          {/* STEP 2: Client & Project Details Form */}
          <div className="glass-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              <UserCheck size={17} color={isPlumbing ? '#2dd4bf' : '#fbbf24'} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                STEP 2: Client & Project Information
              </h3>
            </div>

            <div className="responsive-form-grid-2">
              <div className="form-group">
                <label className="form-label"><UserCheck size={13} /> Client Name *</label>
                <input
                  type="text"
                  name="client_name"
                  required
                  value={clientInfo.client_name}
                  onChange={handleClientChange}
                  placeholder="e.g. Abdul Rahman"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Phone size={13} /> Client Phone</label>
                <input
                  type="text"
                  name="client_phone"
                  value={clientInfo.client_phone}
                  onChange={handleClientChange}
                  placeholder="e.g. +91 98470 12345"
                  className="form-input"
                />
              </div>
            </div>

            <div className="responsive-form-grid-3">
              <div className="form-group">
                <label className="form-label"><FileText size={13} /> Project / Site</label>
                <input
                  type="text"
                  name="project_name"
                  value={clientInfo.project_name}
                  onChange={handleClientChange}
                  placeholder="e.g. Green Villa"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><MapPin size={13} /> Location</label>
                <input
                  type="text"
                  name="location"
                  value={clientInfo.location}
                  onChange={handleClientChange}
                  placeholder="e.g. Calicut"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Calendar size={13} /> Date</label>
                <input
                  type="text"
                  name="date"
                  value={clientInfo.date}
                  onChange={handleClientChange}
                  placeholder="e.g. 11 Aug 2026"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Project Notes / Instructions</label>
              <textarea
                name="notes"
                rows="2"
                value={clientInfo.notes}
                onChange={handleClientChange}
                placeholder="e.g. Deliver by 10 AM. Use ISI brand fittings."
                className="form-textarea"
              />
            </div>
          </div>

          {/* STEP 3: Material Item Search & Catalog */}
          <div className="glass-card" style={{ padding: '1.15rem' }}>
            <div className="catalog-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Search size={17} color={isPlumbing ? '#2dd4bf' : '#fbbf24'} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  STEP 3: Select {isPlumbing ? 'Plumbing' : 'Electrical'} Materials
                </h3>
              </div>

              {/* Search Bar & Add Item Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '420px', justifyContent: 'flex-end' }}>
                <div className="catalog-search-wrap" style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search material or code..."
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.825rem' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddItemModal(true)}
                  className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
                  style={{ height: '38px', padding: '0 0.85rem', gap: '0.35rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Swipeable Category Filter Pills */}
            <div className="category-scroll" style={{ marginBottom: '1rem', paddingBottom: '4px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm ${selectedCategory === cat ? (isPlumbing ? 'btn-plumb' : 'btn-elec') : 'btn-outline'}`}
                  style={{ borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items Cards Grid */}
            {loading ? (
              <p style={{ textTransform: 'none', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                Loading material database...
              </p>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                <p style={{ fontWeight: 600, color: '#94a3b8' }}>
                  {searchQuery ? `No materials match "${searchQuery}"` : 'No materials found in this category'}
                </p>
                <p style={{ fontSize: '0.78rem', marginTop: '0.2rem', marginBottom: '1rem' }}>
                  Can't find what you need? Add it directly to your material list.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(true)}
                  className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
                  style={{ gap: '0.4rem', margin: '0 auto', display: 'inline-flex' }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add "{searchQuery || 'Custom Material'}" as Item</span>
                </button>
              </div>
            ) : (
              <div className="items-catalog-grid">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onAdd={addItem}
                    addedQuantity={getAddedQuantity(item.name)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Desktop Active Drawer */}
        <div className="desktop-drawer-column">
          <div style={{ position: 'sticky', top: '80px' }}>
            <ListDrawer
              onShowPreview={() => setShowPreviewModal(true)}
            />
          </div>
        </div>

      </div>

      {/* Floating Bottom Action Bar for Mobile Screens (< 1024px) */}
      <div className="mobile-fab-drawer">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className={`btn btn-lg ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
          style={{
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            justifyContent: 'space-between',
            padding: '0.85rem 1.15rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>View Material List</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge" style={{ background: '#ffffff', color: '#0f172a', fontWeight: 800 }}>
              {totalUniqueItems} items ({totalItemsCount} units)
            </span>
            <ChevronRight size={18} />
          </div>
        </button>
      </div>

      {/* Mobile Drawer Modal Overlay */}
      {mobileDrawerOpen && (
        <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }}>
          <div className="modal-content" style={{
            maxWidth: '100%',
            width: '100%',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            maxHeight: '90vh',
            padding: '1rem',
            background: '#1e293b'
          }}>
            <ListDrawer
              onClose={() => setMobileDrawerOpen(false)}
              onShowPreview={() => {
                setMobileDrawerOpen(false);
                setShowPreviewModal(true);
              }}
              onSaveSuccess={() => {}}
            />
          </div>
        </div>
      )}

        {/* PDF Document Preview Modal */}
        {showPreviewModal && (
          <PDFDocument
            listData={{
              list_type: listType,
              client_name: clientInfo.client_name,
              client_phone: clientInfo.client_phone,
              project_name: clientInfo.project_name,
              location: clientInfo.location,
              date: clientInfo.date,
              notes: clientInfo.notes,
              items: selectedItems,
            }}
            userProfile={user}
            onClose={() => setShowPreviewModal(false)}
          />
        )}

        {/* Add New Item Modal */}
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          defaultType={listType}
          initialQuery={searchQuery}
          existingCategories={categories}
          onItemCreated={() => fetchCatalogItems()}
        />

      <style>{`
        .create-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(320px, 1.2fr);
          gap: 1.5rem;
          align-items: start;
          width: 100%;
        }

        .trade-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
        }

        .responsive-form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
        }

        .responsive-form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
        }

        .items-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.85rem;
          width: 100%;
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .create-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .desktop-drawer-column {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-form-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .responsive-form-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .trade-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .catalog-search-wrap {
            max-width: 100% !important;
          }
        }

        @media (max-width: 600px) {
          .items-catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default CreateList;
