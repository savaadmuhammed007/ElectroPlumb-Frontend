import React from 'react';
import { Download, Printer, X } from 'lucide-react';
import { downloadPDF, printPDFInNewTab } from '../services/pdfService';

const PDFDocument = ({ listData, userProfile, onClose }) => {
  const isPlumbing = listData?.list_type === 'plumbing';
  const worker = userProfile || {};
  const workerName = worker.user?.first_name 
    ? `${worker.user.first_name} ${worker.user.last_name || ''}`.trim() 
    : worker.user?.username || 'Electrical & Plumbing Specialist';
  const businessName = worker.profile?.business_name || `${workerName} Technical Services`;
  const workerPhone = worker.profile?.phone || 'N/A';
  const workerEmail = worker.user?.email || '';
  const workerAddress = [worker.profile?.address, worker.profile?.city, worker.profile?.state, worker.profile?.pin_code]
    .filter(Boolean)
    .join(', ');

  const totalQuantity = (listData?.items || []).reduce((acc, curr) => acc + parseInt(curr.quantity || 0, 10), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', width: '100%', background: '#0f172a', padding: '1.25rem' }}>
        
        {/* Modal Top Actions Bar */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>
              A4 PDF Material List Preview
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Print-ready formatted document preview
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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
              <button onClick={onClose} className="btn btn-sm btn-outline" style={{ color: '#fff', padding: '0.35rem 0.5rem' }}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable container on mobile so the A4 sheet preserves exact proportions */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
          {/* Crisp A4 Sheet Container */}
          <div
            className="a4-container"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '4px',
              padding: '24mm 20mm',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontFamily: 'Helvetica, Arial, sans-serif',
              minWidth: '640px',
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
                    Phone: {workerPhone} {workerEmail ? `| Email: ${workerEmail}` : ''}
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
                  <strong style={{ color: '#475569' }}>Client Name: </strong>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{listData?.client_name || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Project / Site: </strong>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{listData?.project_name || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Client Phone: </strong>
                  <span>{listData?.client_phone || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Date: </strong>
                  <span>{listData?.date || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Location: </strong>
                  <span>{listData?.location || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Ref ID: </strong>
                  <span>{listData?.id ? `#MRL-${listData.id}` : 'DRAFT'}</span>
                </div>
              </div>

              {/* 4. Material Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <thead>
                  <tr style={{ background: isPlumbing ? '#0d9488' : '#d97706', color: '#ffffff' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #cbd5e1', width: '40px' }}>No.</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Material / Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1', width: '130px' }}>Category</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '80px' }}>Quantity</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #cbd5e1', width: '70px' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(listData?.items || []).map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{index + 1}</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: '600' }}>{item.item_name}</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', color: '#64748b' }}>{item.category || 'General'}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#0f172a' }}>{item.quantity}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{item.unit || 'Piece'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Items Banner */}
              <div style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: '13px',
                marginBottom: '20px'
              }}>
                <span>TOTAL DISTINCT ITEMS: {listData?.items?.length || 0}</span>
                <span>TOTAL QUANTITY UNITS: {totalQuantity}</span>
              </div>

              {/* Notes Section */}
              {listData?.notes && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>
                    ADDITIONAL NOTES & SPECIAL INSTRUCTIONS:
                  </h4>
                  <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                    {listData.notes}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Signatures Footer */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <div style={{ width: '220px' }}>
                  <div style={{ borderBottom: '1px dashed #64748b', height: '30px', marginBottom: '6px' }}></div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Client Signature</div>
                </div>

                <div style={{ width: '240px', textAlign: 'right' }}>
                  <div style={{ borderBottom: '1px dashed #64748b', height: '30px', marginBottom: '6px' }}></div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Worker Signature</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Prepared by: {workerName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Contact: {workerPhone}</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '24px' }}>
                Generated by ElectroPlumb Material Requirement Manager — Official Document
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PDFDocument;
