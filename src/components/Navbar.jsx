import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListContext } from '../context/ListContext';
import { 
  Zap, Wrench, LayoutDashboard, FileText, 
  User, Shield, LogOut, Menu, X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { totalUniqueItems, listType } = useContext(ListContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

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
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: listType === 'plumbing' 
              ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            boxShadow: listType === 'plumbing' ? '0 0 12px rgba(20, 184, 166, 0.4)' : '0 0 12px rgba(245, 158, 11, 0.4)'
          }}>
            {listType === 'plumbing' ? <Wrench size={20} /> : <Zap size={20} />}
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              Electro<span style={{ color: listType === 'plumbing' ? '#2dd4bf' : '#fbbf24' }}>Plumb</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Material Manager
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link to="/dashboard" className={`btn btn-sm ${isActive('/dashboard') ? 'btn-primary' : 'btn-outline'}`}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>

            {/* Separate Electrical List Button */}
            <Link to="/electrical-list" className={`btn btn-sm ${isActive('/electrical-list') || isActive('/create-electrical-list') ? 'btn-elec' : 'btn-outline'}`}>
              <Zap size={15} color="#fbbf24" /> Electrical List
              {listType === 'electrical' && totalUniqueItems > 0 && (
                <span className="badge" style={{ background: '#ffffff', color: '#0f172a', padding: '0.1rem 0.35rem', fontSize: '0.68rem', fontWeight: 800 }}>
                  {totalUniqueItems}
                </span>
              )}
            </Link>

            {/* Separate Plumbing List Button */}
            <Link to="/plumbing-list" className={`btn btn-sm ${isActive('/plumbing-list') || isActive('/create-plumbing-list') ? 'btn-plumb' : 'btn-outline'}`}>
              <Wrench size={15} color="#2dd4bf" /> Plumbing List
              {listType === 'plumbing' && totalUniqueItems > 0 && (
                <span className="badge" style={{ background: '#ffffff', color: '#0f172a', padding: '0.1rem 0.35rem', fontSize: '0.68rem', fontWeight: 800 }}>
                  {totalUniqueItems}
                </span>
              )}
            </Link>

            <Link to="/my-lists" className={`btn btn-sm ${isActive('/my-lists') ? 'btn-secondary' : 'btn-outline'}`}>
              <FileText size={15} /> My Lists
            </Link>

            <Link to="/profile" className={`btn btn-sm ${isActive('/profile') ? 'btn-secondary' : 'btn-outline'}`}>
              <User size={15} /> Profile
            </Link>

            {isAdmin && (
              <Link to="/admin" className={`btn btn-sm ${isActive('/admin') || isActive('/admin/items') ? 'btn-primary' : 'btn-outline'}`}>
                <Shield size={15} /> Admin
              </Link>
            )}
          </div>
        )}

        {/* User Right Section */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Desktop User Info Pill */}
            <div className="desktop-user-pill" style={{ textAlign: 'right', marginRight: '0.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                {user.first_name || user.username}
              </span>
              <span className={`badge ${user.profile?.role === 'plumber' ? 'badge-plumb' : 'badge-elec'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                {user.profile?.role || 'worker'}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-sm btn-danger hide-on-mobile" title="Log Out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>

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
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-sm btn-outline">Login</Link>
            <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && user && (
        <div style={{
          background: '#1e293b',
          borderBottom: '2px solid #334155',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
        }}>
          {/* User profile summary row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            background: '#0f172a',
            borderRadius: '8px',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {(user.first_name || user.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {user.profile?.business_name || 'Worker'}
                </div>
              </div>
            </div>
            <span className={`badge ${user.profile?.role === 'plumber' ? 'badge-plumb' : 'badge-elec'}`}>
              {user.profile?.role || 'worker'}
            </span>
          </div>

          <Link 
            to="/dashboard" 
            onClick={closeMenu} 
            className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          {/* Separate Mobile Electrical List Button */}
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

          {/* Separate Mobile Plumbing List Button */}
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
            <FileText size={18} /> My Lists History
          </Link>

          <Link 
            to="/profile" 
            onClick={closeMenu} 
            className={`btn ${isActive('/profile') ? 'btn-secondary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
          >
            <User size={18} /> Business Profile
          </Link>

          {isAdmin && (
            <Link 
              to="/admin" 
              onClick={closeMenu} 
              className={`btn ${isActive('/admin') || isActive('/admin/items') ? 'btn-primary' : 'btn-outline'}`} 
              style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem' }}
            >
              <Shield size={18} /> Admin Dashboard & Items
            </Link>
          )}

          <div style={{ borderTop: '1px solid #334155', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <button 
              onClick={handleLogout} 
              className="btn btn-danger" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav-links { display: flex; }
        .desktop-user-pill { display: block; }
        .show-on-mobile { display: none; }
        .hide-on-mobile { display: inline-flex; }

        @media (max-width: 992px) {
          .desktop-nav-links { display: none !important; }
          .desktop-user-pill { display: none !important; }
          .show-on-mobile { display: inline-flex !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
