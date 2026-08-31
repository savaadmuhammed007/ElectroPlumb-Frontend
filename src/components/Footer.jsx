import React from 'react';
import { Zap, Wrench } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="no-print" style={{
      marginTop: 'auto',
      background: '#090d16',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '1.75rem 0',
      color: '#64748b',
      fontSize: '0.825rem'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={15} color="#f59e0b" />
            <Wrench size={15} color="#14b8a6" />
          </div>
          <span style={{ color: '#94a3b8', fontWeight: 700 }}>ElectroPlumb</span>
          <span>&copy; {new Date().getFullYear()} — Professional A4 Material List Builder</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.78rem' }}>
          <span style={{ color: '#475569' }}>Mobile-Optimized</span>
          <span style={{ color: '#334155' }}>•</span>
          <span style={{ color: '#475569' }}>A4 PDF Generator</span>
          <span style={{ color: '#334155' }}>•</span>
          <span style={{ color: '#475569' }}>Local Drafts</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
