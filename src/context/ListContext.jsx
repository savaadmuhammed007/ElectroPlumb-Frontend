import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const ListContext = createContext();

const DRAFT_KEY = 'electroplumb_material_draft';

const getDefaultClientInfo = () => ({
  client_name: '',
  client_phone: '',
  project_name: '',
  location: '',
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  notes: '',
});

export const ListProvider = ({ children }) => {
  const [editingId, setEditingId] = useState(null);
  const [listType, setListType] = useState('electrical'); // 'electrical' | 'plumbing'
  const [clientInfo, setClientInfo] = useState(getDefaultClientInfo());
  const [selectedItems, setSelectedItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Restore draft on initial load
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.selectedItems?.length > 0 || parsed.clientInfo?.client_name) {
          setListType(parsed.list_type || 'electrical');
          setClientInfo(parsed.clientInfo || getDefaultClientInfo());
          setSelectedItems(parsed.selectedItems || []);
          setEditingId(parsed.editingId || null);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved draft:', e);
    }
  }, []);

  // Auto-save draft on state change
  useEffect(() => {
    const hasData =
      selectedItems.length > 0 ||
      clientInfo.client_name?.trim() ||
      clientInfo.project_name?.trim() ||
      clientInfo.notes?.trim();

    if (hasData) {
      const draftData = {
        editingId,
        list_type: listType,
        clientInfo,
        selectedItems,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [editingId, listType, clientInfo, selectedItems]);

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
    localStorage.removeItem(DRAFT_KEY);
    showToast('Cleared material list draft');
  };

  const loadListForEdit = (savedList) => {
    setEditingId(savedList.id);
    setListType(savedList.list_type);
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
    localStorage.removeItem(DRAFT_KEY);

    return res.data;
  };

  return (
    <ListContext.Provider
      value={{
        editingId,
        listType,
        setListType,
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
        totalItemsCount: selectedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        totalUniqueItems: selectedItems.length,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export default ListContext;
