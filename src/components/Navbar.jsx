import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListContext } from '../context/ListContext';
import { 
  Zap, Wrench, LayoutDashboard, FileText, 
  Settings, Shield, LogOut, Menu, X, PlusCircle 
} from 'lucide-react';

const Navbar = () => {
  const { isAdmin, adminLogout } = useContext(AuthContext);
  const { totalUniqueItems, listType } = useContext(ListContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  const handleExitAdmin = () => {
    adminLogout();
    closeMenu();
    navigate('/dashboard');
  };

  return (
    <nav className="no-print" style={{
      background: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', height: '64px' }}>
        
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: listType === 'plumbing' 
              ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            boxShadow: listType === 'plumbing' ? '0 0 14px rgba(20, 184, 166, 0.4)' : '0 0 14px rgba(245, 158, 11, 0.4)'
          }}>
            {listType === 'plumbing' ? <Wrench size={22} /> : <Zap size={22} />}
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              Electro<span style={{ color: listType === 'plumbing' ? '#2dd4bf' : '#fbbf24' }}>Plumb</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Material Manager
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link to="/dashboard" className={`btn btn-sm ${isActive('/dashboard') || isActive('/') ? 'btn-primary' : 'btn-outline'}`}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>

          {/* Electrical List Button */}
          <Link to="/electrical-list" className={`btn btn-sm ${isActive('/electrical-list') || isActive('/create-electrical-list') ? 'btn-elec' : 'btn-outline'}`}>
            <Zap size={15} color="#fbbf24" /> Electrical List
            {listType === 'electrical' && totalUniqueItems > 0 && (
              <span className="badge" style={{ background: '#ffffff', color: '#0f172a', padding: '0.1rem 0.35rem', fontSize: '0.68rem', fontWeight: 800 }}>
                {totalUniqueItems}
              </span>
            )}
          </Link>

          {/* Plumbing List Button */}
          <Link to="/plumbing-list" className={`btn btn-sm ${isActive('/plumbing-list') || isActive('/create-plumbing-list') ? 'btn-plumb' : 'btn-outline'}`}>
            <Wrench size={15} color="#2dd4bf" /> Plumbing List
            {listType === 'plumbing' && totalUniqueItems > 0 && (
              <span className="badge" style={{ background: '#ffffff', color: '#0f172a', padding: '0.1rem 0.35rem', fontSize: '0.68rem', fontWeight: 800 }}>
                {totalUniqueItems}
              </span>
            )}
          </Link>

          {/* Saved Lists Button */}
          <Link to="/my-lists" className={`btn btn-sm ${isActive('/my-lists') ? 'btn-secondary' : 'btn-outline'}`}>
            <FileText size={15} /> Saved Lists
          </Link>

          {/* Business Settings / Profile */}
          <Link to="/profile" className={`btn btn-sm ${isActive('/profile') ? 'btn-secondary' : 'btn-outline'}`} title="PDF & Business Header Settings">
            <Settings size={15} /> Settings
          </Link>

          {/* Admin Panel Button */}
          <Link 
            to="/admin" 
            className={`btn btn-sm ${isActive('/admin') || isActive('/admin/items') ? 'btn-primary' : 'btn-outline'}`}
            style={isAdmin ? { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)' } : {}}
          >
            <Shield size={15} color={isAdmin ? '#60a5fa' : '#94a3b8'} /> Admin Panel
          </Link>
        </div>

        {/* Right Section / Admin Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAdmin && (
            <div className="desktop-admin-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge" style={{ background: '#1e3a8a', color: '#93c5fd', border: '1px solid #3b82f6', fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                🛡️ Admin Active
              </span>
              <button onClick={handleExitAdmin} className="btn btn-sm btn-outline" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }} title="Exit Admin Mode">
                <LogOut size={13} /> Exit Admin
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="show-on-mobile btn btn-sm btn-outline"
            style={{ padding: '0.45rem', minWidth: '40px', minHeight: '40px', color: '#f8fafc' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#1e293b',
          borderBottom: '2px solid #334155',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
        }}>
          <Link 
            to="/dashboard" 
            onClick={closeMenu} 
            className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          {/* Mobile Electrical List Button */}
          <Link 
            to="/electrical-list" 
            onClick={closeMenu} 
            className={`btn ${isActive('/electrical-list') ? 'btn-elec' : 'btn-outline'}`} 
            style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="#fbbf24" /> Electrical Material List
            </div>
            {listType === 'electrical' && totalUniqueItems > 0 && (
              <span className="badge" style={{ background: '#ffffff', color: '#0f172a' }}>
                {totalUniqueItems}
              </span>
            )}
          </Link>

          {/* Mobile Plumbing List Button */}
          <Link 
            to="/plumbing-list" 
            onClick={closeMenu} 
            className={`btn ${isActive('/plumbing-list') ? 'btn-plumb' : 'btn-outline'}`} 
            style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={18} color="#2dd4bf" /> Plumbing Material List
            </div>
            {listType === 'plumbing' && totalUniqueItems > 0 && (
              <span className="badge" style={{ background: '#ffffff', color: '#0f172a' }}>
                {totalUniqueItems}
              </span>
            )}
          </Link>

          <Link 
            to="/my-lists" 
            onClick={closeMenu} 
            className={`btn ${isActive('/my-lists') ? 'btn-secondary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <FileText size={18} /> Saved Lists
          </Link>

          <Link 
            to="/profile" 
            onClick={closeMenu} 
            className={`btn ${isActive('/profile') ? 'btn-secondary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <Settings size={18} /> Business Settings & PDF
          </Link>

          <Link 
            to="/admin" 
            onClick={closeMenu} 
            className={`btn ${isActive('/admin') || isActive('/admin/items') ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <Shield size={18} color="#60a5fa" /> Admin Panel & Catalog
          </Link>

          {isAdmin && (
            <div style={{ borderTop: '1px solid #334155', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              <button 
                onClick={handleExitAdmin} 
                className="btn btn-outline" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', color: '#fca5a5' }}
              >
                <LogOut size={18} /> Exit Admin Mode
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .desktop-nav-links { display: flex; }
        .desktop-admin-pill { display: flex; }
        .show-on-mobile { display: none; }

        @media (max-width: 992px) {
          .desktop-nav-links { display: none !important; }
          .desktop-admin-pill { display: none !important; }
          .show-on-mobile { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
