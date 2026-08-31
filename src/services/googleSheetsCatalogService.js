import api from './api';

const GOOGLE_SHEET_KEY = 'electroplumb_linked_catalog_sheet';
const GOOGLE_WEBHOOK_KEY = 'electroplumb_linked_catalog_webhook';

/**
 * Get stored Google Sheet URL (for pulling)
 */
export const getStoredSheetUrl = () => {
  return localStorage.getItem(GOOGLE_SHEET_KEY) || '';
};

/**
 * Save Google Sheet URL
 */
export const setStoredSheetUrl = (url) => {
  localStorage.setItem(GOOGLE_SHEET_KEY, url.trim());
};

/**
 * Get stored Google Apps Script Web App URL (for live push)
 */
export const getStoredWebhookUrl = () => {
  return localStorage.getItem(GOOGLE_WEBHOOK_KEY) || '';
};

/**
 * Save Google Apps Script Web App URL
 */
export const setStoredWebhookUrl = (url) => {
  localStorage.setItem(GOOGLE_WEBHOOK_KEY, url.trim());
};

/**
 * Trigger backend synchronization to pull items FROM Google Sheet
 */
export const syncWithGoogleSheet = async (sheetUrl) => {
  const res = await api.post('/admin/items/google-sheet-sync/', { sheet_url: sheetUrl });
  setStoredSheetUrl(sheetUrl);
  return res.data;
};

/**
 * Push ALL catalog items TO Google Sheet via Web App URL
 */
export const pushAllItemsToGoogleSheet = async (webhookUrl, items = null, itemType = null) => {
  const payload = {
    webhook_url: webhookUrl,
    action: 'sync_all',
  };
  if (items) payload.items = items;
  if (itemType) payload.item_type = itemType;

  const res = await api.post('/admin/items/google-sheet-push/', payload);
  setStoredWebhookUrl(webhookUrl);
  return res.data;
};

/**
 * Push a single newly created/edited item TO Google Sheet
 */
export const pushSingleItemToGoogleSheet = async (webhookUrl, item) => {
  const payload = {
    webhook_url: webhookUrl,
    action: 'add_item',
    item: item,
  };
  const res = await api.post('/admin/items/google-sheet-push/', payload);
  setStoredWebhookUrl(webhookUrl);
  return res.data;
};

/**
 * Google Apps Script Web App Code template for 1-click copy
 */
export const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Action 1: Sync all items (Replace entire sheet)
    if (data.action === 'sync_all' || Array.isArray(data.items)) {
      var items = data.items || [];
      sheet.clearContents();
      sheet.appendRow(['item_code', 'name', 'item_type', 'category', 'unit', 'description', 'status']);
      for (var i = 0; i < items.length; i++) {
        var itm = items[i];
        sheet.appendRow([
          itm.item_code || '',
          itm.name || '',
          itm.item_type || 'electrical',
          itm.category || '',
          itm.unit || 'Piece',
          itm.description || '',
          itm.status || 'active'
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Successfully synced ' + items.length + ' catalog items to Google Sheet!'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Action 2: Add single item (Append to sheet)
    if (data.action === 'add_item' && data.item) {
      var itm = data.item;
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['item_code', 'name', 'item_type', 'category', 'unit', 'description', 'status']);
      }
      sheet.appendRow([
        itm.item_code || '',
        itm.name || '',
        itm.item_type || 'electrical',
        itm.category || '',
        itm.unit || 'Piece',
        itm.description || '',
        itm.status || 'active'
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Added ' + itm.name + ' (' + itm.item_code + ') to Google Sheet!'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid payload action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

/**
 * Format catalog items into tab-separated values and copy to clipboard,
 * then open sheets.new so admin can paste directly into Google Sheets.
 */
export const openCatalogInGoogleSheets = (items, itemType = 'all') => {
  const filtered = itemType === 'all' 
    ? items 
    : items.filter((i) => i.item_type === itemType);

  const headers = ['item_code', 'name', 'item_type', 'category', 'unit', 'description', 'status'];
  
  const rows = filtered.map((item) => [
    item.item_code,
    item.name,
    item.item_type,
    item.category,
    item.unit,
    item.description || '',
    item.status || 'active'
  ]);

  const tsvContent = [
    headers.join('\t'),
    ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join('\t'))
  ].join('\n');

  // Copy to clipboard
  navigator.clipboard.writeText(tsvContent).then(() => {
    window.open('https://sheets.new', '_blank');
  }).catch((err) => {
    console.error('Clipboard copy failed:', err);
    window.open('https://sheets.new', '_blank');
  });
};

/**
 * Download sample CSV template for Google Sheets
 */
export const downloadGoogleSheetTemplate = () => {
  const csvContent = [
    'item_code,name,item_type,category,unit,description,status',
    'ELE-WIRE-1.5,1.5 sq mm FR House Wire,electrical,Wires & Cables,Meter,Multi-strand copper PVC insulated FR wire,active',
    'ELE-SW-6A,6A 1-Way Modular Switch,electrical,Modular Switches,Piece,Flame-retardant polycarbonate switch,active',
    'ELE-MCB-16A,16A Single Pole C-Curve MCB,electrical,MCBs & DBs,Piece,10kA breaking capacity miniature circuit breaker,active',
    'PLM-CPVC-0.75,3/4 inch CPVC Pipe SDR 11,plumbing,Pipes,Length,Hot and cold water supply pipe 3 meter length,active',
    'PLM-ELB-0.75,3/4 inch CPVC 90 Degree Elbow,plumbing,Fittings,Piece,Heavy duty pressure fitting,active',
    'PLM-VAL-0.75,3/4 inch Brass Ball Valve,plumbing,Valves & Taps,Piece,Full bore quarter turn water shutoff valve,active'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'google_sheets_materials_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
