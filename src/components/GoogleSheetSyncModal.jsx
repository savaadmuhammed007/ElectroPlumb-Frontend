import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, CheckCircle2, AlertCircle, 
  ExternalLink, Download, FileSpreadsheet, Copy, Check,
  UploadCloud, DownloadCloud, Code, ChevronRight
} from 'lucide-react';
import { 
  getStoredSheetUrl, setStoredSheetUrl, 
  getStoredWebhookUrl, setStoredWebhookUrl,
  syncWithGoogleSheet, pushAllItemsToGoogleSheet,
  openCatalogInGoogleSheets, downloadGoogleSheetTemplate,
  GOOGLE_APPS_SCRIPT_CODE
} from '../services/googleSheetsCatalogService';

const GoogleSheetSyncModal = ({ items, onClose, onSyncSuccess }) => {
  const [activeTab, setActiveTab] = useState('push'); // 'push' (to sheet) | 'pull' (from sheet)
  const [sheetUrl, setSheetUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  useEffect(() => {
    setSheetUrl(getStoredSheetUrl());
    setWebhookUrl(getStoredWebhookUrl());
  }, []);

  const handlePullSync = async (e) => {
    e?.preventDefault();
    if (!sheetUrl.trim()) {
      setError('Please paste a valid Google Sheet URL to pull items.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await syncWithGoogleSheet(sheetUrl);
      setResult(data);
      setStoredSheetUrl(sheetUrl);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Google Sheet Pull Error:', err);
      let errMsg = err.response?.data?.error;
      if (!errMsg) {
        if (err.response?.status === 401 || err.message?.includes('401')) {
          errMsg = "Access Denied by Google (401). Please open your Google Sheet, click 'Share' (top right), change General Access from 'Restricted' to 'Anyone with the link' (Viewer), and try again.";
        } else {
          errMsg = err.message || 'Failed to pull from Google Sheet.';
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePushSync = async (e) => {
    e?.preventDefault();
    if (!webhookUrl.trim()) {
      setError('Please provide your Google Apps Script Web App URL to push items.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await pushAllItemsToGoogleSheet(webhookUrl, items);
      setResult({
        message: `Successfully synchronized all ${data.count || items.length} catalog items to your Google Sheet!`,
        total_synced: data.count || items.length
      });
      setStoredWebhookUrl(webhookUrl);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Google Sheet Push Error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to push items to Google Sheet.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 3000);
    });
  };

  const handleOpenSheetsNew = () => {
    openCatalogInGoogleSheets(items);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 4000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '680px', width: '100%', padding: '1.5rem', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Google Sheets Catalog Synchronization
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Two-way live synchronization between your database and Google Sheets
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.35rem', minWidth: '32px', minHeight: '32px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sync Direction Mode Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('push'); setResult(null); setError(null); }}
            className={`btn ${activeTab === 'push' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'center',
              padding: '0.75rem',
              background: activeTab === 'push' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
              borderColor: activeTab === 'push' ? '#10b981' : '#334155'
            }}
          >
            <UploadCloud size={16} /> Sync ALL Items TO Sheet
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('pull'); setResult(null); setError(null); }}
            className={`btn ${activeTab === 'pull' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'center',
              padding: '0.75rem',
              background: activeTab === 'pull' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
              borderColor: activeTab === 'pull' ? '#3b82f6' : '#334155'
            }}
          >
            <DownloadCloud size={16} /> Pull / Import FROM Sheet
          </button>
        </div>

        {/* Feedback Alert */}
        {result && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#a7f3d0',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#34d399" />
              <span>{result.message}</span>
            </div>
            {result.created !== undefined && (
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                <span>✨ <strong>{result.created}</strong> Created</span>
                <span>🔄 <strong>{result.updated}</strong> Updated</span>
                <span>📦 <strong>{result.total_synced}</strong> Total</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700 }}>Synchronization Error</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{error}</div>
            </div>
          </div>
        )}

        {/* TAB 1: PUSH ALL ITEMS TO GOOGLE SHEET */}
        {activeTab === 'push' && (
          <div>
            <form onSubmit={handlePushSync} style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ justifyContent: 'space-between' }}>
                  <span>Google Apps Script Web App URL</span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Live Push Endpoint</span>
                </label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.75rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  borderColor: '#10b981',
                  marginTop: '0.5rem'
                }}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Pushing All Items to Google Sheet...' : `Sync All ${items.length} Items to Google Sheet`}
              </button>
            </form>

            {/* Quick Apps Script Setup Box */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  <Code size={16} color="#10b981" />
                  <span>Google Apps Script Setup (1-Minute Setup)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  {scriptCopied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  {scriptCopied ? 'Code Copied!' : 'Copy Script Code'}
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0.5rem 0' }}>
                To enable 1-click live syncing directly into your Google Spreadsheet:
              </p>

              <ol style={{ fontSize: '0.76rem', color: '#cbd5e1', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.5 }}>
                <li>In your Google Sheet, click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                <li>Delete any code in the editor, click <strong>Copy Script Code</strong> above, and paste it.</li>
                <li>Click <strong>Deploy</strong> (top right) → <strong>New deployment</strong> → Select type: <strong>Web app</strong>.</li>
                <li>Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
                <li>Click <strong>Deploy</strong> and paste the generated <strong>Web App URL</strong> in the box above!</li>
              </ol>

              <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowScriptDetails(!showScriptDetails)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                >
                  <ChevronRight size={14} style={{ transform: showScriptDetails ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  {showScriptDetails ? 'Hide Script Code' : 'View Script Code'}
                </button>

                {showScriptDetails && (
                  <pre style={{
                    background: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    overflowX: 'auto',
                    marginTop: '0.5rem',
                    maxHeight: '160px'
                  }}>
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PULL FROM GOOGLE SHEET */}
        {activeTab === 'pull' && (
          <div>
            <form onSubmit={handlePullSync} style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ justifyContent: 'space-between' }}>
                  <span>Google Spreadsheet URL</span>
                  <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>Public View Link</span>
                </label>
                <input
                  type="url"
                  required
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFM.../edit"
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ flex: '1 1 200px', justifyContent: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Pulling Items...' : 'Pull & Import From Google Sheet'}
                </button>

                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    <ExternalLink size={16} /> Open Sheet
                  </a>
                )}
              </div>
            </form>

            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <strong style={{ color: '#f8fafc' }}>💡 Sharing Requirement:</strong> Click <strong>Share</strong> in your Google Sheet, set <em>General Access</em> to <strong>"Anyone with the link can view"</strong>, and paste the URL.
            </div>
          </div>
        )}

        {/* Fallback Tools (Open in Google Sheets / CSV Template) */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleOpenSheetsNew}
            className="btn btn-outline btn-sm"
            style={{ borderColor: '#3b82f6', color: '#60a5fa' }}
          >
            {copiedData ? <Check size={14} /> : <Copy size={14} />}
            {copiedData ? 'Copied & Opening sheets.new...' : 'Open in Google Sheets (sheets.new)'}
          </button>

          <button
            type="button"
            onClick={downloadGoogleSheetTemplate}
            className="btn btn-outline btn-sm"
          >
            <Download size={14} /> Download CSV Template
          </button>
        </div>

      </div>
    </div>
  );
};

export default GoogleSheetSyncModal;
