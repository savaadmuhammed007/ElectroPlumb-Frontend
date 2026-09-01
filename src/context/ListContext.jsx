import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

export const ListContext = createContext();

const getDefaultClientInfo = () => ({
  client_name: '',
  client_phone: '',
  project_name: '',
  location: '',
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  notes: '',
});

const getTradeDraftKey = (trade) => {
  return `electroplumb_draft_${trade || 'electrical'}`;
};

export const ListProvider = ({ children }) => {
  const [editingId, setEditingId] = useState(null);
  const [listType, setListTypeState] = useState('electrical'); // 'electrical' | 'plumbing'
  const [clientInfo, setClientInfo] = useState(getDefaultClientInfo());
  const [selectedItems, setSelectedItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const listTypeRef = useRef(listType);
  const clientInfoRef = useRef(clientInfo);
  const selectedItemsRef = useRef(selectedItems);
  const editingIdRef = useRef(editingId);

  // Keep refs synchronized for immediate access during page/trade transitions
  useEffect(() => {
    listTypeRef.current = listType;
    clientInfoRef.current = clientInfo;
    selectedItemsRef.current = selectedItems;
    editingIdRef.current = editingId;
  }, [listType, clientInfo, selectedItems, editingId]);

  // Helper to persist draft immediately
  const persistDraft = (trade, data) => {
    if (!trade) return;
    const key = getTradeDraftKey(trade);
    const hasData =
      (data.selectedItems && data.selectedItems.length > 0) ||
      (data.clientInfo && data.clientInfo.client_name?.trim()) ||
      (data.clientInfo && data.clientInfo.project_name?.trim()) ||
      (data.clientInfo && data.clientInfo.notes?.trim());

    if (hasData) {
      localStorage.setItem(key, JSON.stringify(data));
      setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      localStorage.removeItem(key);
    }
  };

  // Switch trade and swap in-memory drafts cleanly
  const switchTrade = (newTrade) => {
    if (newTrade === listTypeRef.current) return;

    // 1. Auto-save current trade draft before switching
    if (autoSaveEnabled) {
      persistDraft(listTypeRef.current, {
        editingId: editingIdRef.current,
        list_type: listTypeRef.current,
        clientInfo: clientInfoRef.current,
        selectedItems: selectedItemsRef.current,
      });
    }

    // 2. Load destination trade's draft
    const newKey = getTradeDraftKey(newTrade);
    const saved = localStorage.getItem(newKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEditingId(parsed.editingId || null);
        setClientInfo(parsed.clientInfo || getDefaultClientInfo());
        setSelectedItems(parsed.selectedItems || []);
      } catch {
        setEditingId(null);
        setClientInfo(getDefaultClientInfo());
        setSelectedItems([]);
      }
    } else {
      setEditingId(null);
      setClientInfo(getDefaultClientInfo());
      setSelectedItems([]);
    }

    setListTypeState(newTrade);
  };

  const setListType = (trade) => {
    switchTrade(trade);
  };

  // Restore initial draft on mount
  useEffect(() => {
    try {
      const initialKey = getTradeDraftKey('electrical');
      const saved = localStorage.getItem(initialKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedItems?.length > 0 || parsed.clientInfo?.client_name) {
          setEditingId(parsed.editingId || null);
          setClientInfo(parsed.clientInfo || getDefaultClientInfo());
          setSelectedItems(parsed.selectedItems || []);
          setLastAutoSavedAt('Loaded previous session');
        }
      }
    } catch (e) {
      console.error('Failed to parse initial draft:', e);
    }
  }, []);

  // Continuous auto-save whenever state changes
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const hasData =
      selectedItems.length > 0 ||
      clientInfo.client_name?.trim() ||
      clientInfo.project_name?.trim() ||
      clientInfo.notes?.trim();

    const key = getTradeDraftKey(listType);

    if (hasData) {
      const draftData = {
        editingId,
        list_type: listType,
        clientInfo,
        selectedItems,
      };
      localStorage.setItem(key, JSON.stringify(draftData));
      setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      localStorage.removeItem(key);
    }
  }, [editingId, listType, clientInfo, selectedItems, autoSaveEnabled]);

  // Handle browser tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autoSaveEnabled) {
        persistDraft(listTypeRef.current, {
          editingId: editingIdRef.current,
          list_type: listTypeRef.current,
          clientInfo: clientInfoRef.current,
          selectedItems: selectedItemsRef.current,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveEnabled]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addItem = (item, qty = 1) => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.item === item.id || i.item_name === item.name);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            item: item.id || null,
            item_name: item.name,
            category: item.category || 'General',
            unit: item.unit || 'Piece',
            quantity: qty,
          },
        ];
      }
    });
    showToast(`Added ${item.name} (${qty} ${item.unit || 'Piece'})`);
  };

  const updateQuantity = (itemName, newQty) => {
    if (newQty <= 0) {
      removeItem(itemName);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((i) => (i.item_name === itemName ? { ...i, quantity: parseInt(newQty, 10) || 1 } : i))
    );
  };

  const removeItem = (itemName) => {
    setSelectedItems((prev) => prev.filter((i) => i.item_name !== itemName));
    showToast(`Removed ${itemName}`);
  };

  const clearList = () => {
    setSelectedItems([]);
    setEditingId(null);
    setClientInfo(getDefaultClientInfo());
    localStorage.removeItem(getTradeDraftKey(listType));
    setLastAutoSavedAt(null);
    showToast(`Cleared active ${listType} list`);
  };

  const loadListForEdit = (savedList) => {
    setEditingId(savedList.id);
    setListTypeState(savedList.list_type);
    setClientInfo({
      client_name: savedList.client_name || '',
      client_phone: savedList.client_phone || '',
      project_name: savedList.project_name || '',
      location: savedList.location || '',
      date: savedList.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      notes: savedList.notes || '',
    });
    setSelectedItems(
      savedList.items.map((i) => ({
        item: i.item,
        item_name: i.item_name,
        category: i.category,
        unit: i.unit,
        quantity: i.quantity,
      }))
    );
    showToast(`Loaded list for ${savedList.client_name}`);
  };

  const saveListToServer = async () => {
    if (!clientInfo.client_name.trim()) {
      throw new Error('Please enter Client Name before saving.');
    }
    if (selectedItems.length === 0) {
      throw new Error('Please add at least one material item to the list.');
    }

    const payload = {
      list_type: listType,
      client_name: clientInfo.client_name,
      client_phone: clientInfo.client_phone,
      project_name: clientInfo.project_name,
      location: clientInfo.location,
      date: clientInfo.date,
      notes: clientInfo.notes,
      items: selectedItems.map((i) => ({
        item: i.item,
        item_name: i.item_name,
        category: i.category,
        unit: i.unit,
        quantity: i.quantity,
      })),
    };

    let res;
    if (editingId) {
      res = await api.put(`/lists/${editingId}/`, payload);
      showToast('Updated material list successfully!');
    } else {
      res = await api.post('/lists/', payload);
      showToast('Saved new material list!');
    }

    // Reset list state after saving so it does not linger
    setSelectedItems([]);
    setEditingId(null);
    setClientInfo(getDefaultClientInfo());
    localStorage.removeItem(getTradeDraftKey(listType));
    setLastAutoSavedAt(null);

    return res.data;
  };

  return (
    <ListContext.Provider
      value={{
        editingId,
        listType,
        setListType,
        switchTrade,
        clientInfo,
        setClientInfo,
        selectedItems,
        addItem,
        updateQuantity,
        removeItem,
        clearList,
        loadListForEdit,
        saveListToServer,
        toastMessage,
        lastAutoSavedAt,
        autoSaveEnabled,
        setAutoSaveEnabled,
        totalItemsCount: selectedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        totalUniqueItems: selectedItems.length,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export default ListContext;
