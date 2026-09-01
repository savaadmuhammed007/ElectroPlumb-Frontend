import React from 'react';
import { Download, Printer, X, Eye } from 'lucide-react';
import { downloadPDF, printPDFInNewTab } from '../services/pdfService';

const PDFDocument = ({ listData, userProfile, onClose }) => {
  const isPlumbing = listData?.list_type === 'plumbing';

  let business = {};
  try {
    const saved = localStorage.getItem('electroplumb_business_profile');
    if (saved) business = JSON.parse(saved);
  } catch {}

  const businessName =
    listData?.company_name ||
    userProfile?.profile?.business_name ||
    userProfile?.business_name ||
    business.business_name ||
    'ElectroPlumb Services';

  const technicianName =
    userProfile?.profile?.technician_name ||
    business.technician_name ||
    '';

  const workerPhone =
    userProfile?.profile?.phone ||
    business.phone ||
    '+91 98765 43210';

  const workerEmail =
    userProfile?.user?.email ||
    userProfile?.profile?.email ||
    business.email ||
    '';

  const workerAddress =
    userProfile?.profile?.address ||
    business.address ||
    '';

  const items = listData?.items || [];
  const totalQuantity = items.reduce((acc, curr) => acc + parseInt(curr.quantity || 0, 10), 0);

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0, 0, 0, 0.85)', 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1500, 
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '920px', 
          width: '100%', 
          background: '#0f172a', 
          padding: '1.25rem',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Actions Bar */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={20} color={isPlumbing ? '#2dd4bf' : '#fbbf24'} />
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                A4 PDF Material List Preview
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Official formatted document preview
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => downloadPDF(listData, userProfile)}
              className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
            >
              <Download size={15} /> Download PDF
            </button>
            <button
              onClick={() => printPDFInNewTab(listData, userProfile)}
              className="btn btn-sm btn-primary"
            >
              <Printer size={15} /> Print A4
            </button>
            {onClose && (
              <button 
                onClick={onClose} 
                className="btn btn-sm btn-outline" 
                style={{ color: '#fff', padding: '0.35rem 0.6rem', marginLeft: '0.25rem' }}
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Container with exact A4 Paper Dimensions */}
        <div style={{ 
          overflowY: 'auto', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch', 
          padding: '0.5rem 0',
          flex: 1,
          background: '#0b1120',
          borderRadius: '8px'
        }}>
          <div
            className="a4-container"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '4px',
              padding: '24mm 20mm',
              margin: '0 auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontFamily: 'Helvetica, Arial, sans-serif',
              width: '210mm',
              minWidth: '210mm',
              minHeight: '297mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <div>
              {/* 1. Header Banner */}
              <div style={{
                background: isPlumbing ? '#0d9488' : '#d97706',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.02em', margin: 0, textTransform: 'uppercase' }}>
                    {businessName}
                  </h1>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.9 }}>
                    Phone: {workerPhone} {workerEmail ? `| Email: ${workerEmail}` : ''} {technicianName ? `| Contractor: ${technicianName}` : ''}
                  </p>
                  {workerAddress && (
                    <p style={{ fontSize: '11px', margin: '2px 0 0 0', opacity: 0.85 }}>
                      Address: {workerAddress}
                    </p>
                  )}
                </div>

                <div style={{
                  background: '#ffffff',
                  color: isPlumbing ? '#0d9488' : '#d97706',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {((listData && listData.list_type) || 'Electrical').toUpperCase()} LIST
                </div>
              </div>

              {/* 2. Document Title */}
              <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  MATERIAL REQUIREMENT LIST
                </h2>
              </div>

              {/* 3. Client & Project Info */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 24px',
                fontSize: '13px'
              }}>
                <div>
                  <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <strong style={{ color: '#475569', width: '110px' }}>Client Name:</strong>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{listData?.client_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <strong style={{ color: '#475569', width: '110px' }}>Phone:</strong>
                    <span>{listData?.client_phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <strong style={{ color: '#475569', width: '110px' }}>Location:</strong>
                    <span>{listData?.location || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <strong style={{ color: '#475569', width: '110px' }}>Project / Site:</strong>
                    <span>{listData?.project_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <strong style={{ color: '#475569', width: '110px' }}>Date:</strong>
                    <span>{listData?.date || new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>

              {/* 4. Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: isPlumbing ? '#0d9488' : '#d97706', color: '#ffffff' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px', border: '1px solid #cbd5e1' }}>#</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '140px', border: '1px solid #cbd5e1' }}>Category</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '70px', border: '1px solid #cbd5e1' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px', border: '1px solid #cbd5e1' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        No items added to this material list yet.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                          {item.item_name}
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                          {item.category || 'General'}
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#475569' }}>
                          {item.unit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* 5. Total Count Summary */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#f1f5f9',
                padding: '10px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <span>TOTAL DISTINCT ITEMS: {items.length}</span>
                <span>TOTAL QUANTITY UNITS: {totalQuantity}</span>
              </div>

              {/* 6. Notes Box */}
              {listData?.notes && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px 14px', marginBottom: '20px' }}>
                  <strong style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    ADDITIONAL NOTES & INSTRUCTIONS:
                  </strong>
                  <p style={{ fontSize: '12px', margin: 0, color: '#1e293b', whiteSpace: 'pre-line' }}>
                    {listData.notes}
                  </p>
                </div>
              )}
            </div>

            {/* 7. Footer & Signatures */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '10px' }}>
                <div style={{ textAlign: 'center', width: '180px' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                    Contractor Signature
                  </div>
                </div>

                <div style={{ textAlign: 'center', width: '180px' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                    Client Approval
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                <span>Generated via ElectroPlumb Material Manager</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-sm btn-outline">
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};

export default PDFDocument;
