import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListContext } from '../context/ListContext';
import api from '../services/api';
import { downloadPDF, printPDFInNewTab } from '../services/pdfService';
import PDFDocument from '../components/PDFDocument';
import { ArrowLeft, Download, Printer, Edit3 } from 'lucide-react';

const ListDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { loadListForEdit } = useContext(ListContext);
  const navigate = useNavigate();

  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lists/${id}/`);
      setListData(res.data);
    } catch (err) {
      console.error('Failed to fetch list detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (listData) {
      loadListForEdit(listData);
      if (listData.list_type === 'plumbing') {
        navigate('/plumbing-list');
      } else {
        navigate('/electrical-list');
      }
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', color: '#94a3b8', textAlign: 'center' }}>Loading list detail...</div>;
  }

  if (!listData) {
    return <div className="container" style={{ padding: '4rem 1rem', color: '#ef4444', textAlign: 'center' }}>List not found.</div>;
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button onClick={() => navigate('/my-lists')} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to My Lists
        </button>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={handleEdit} className="btn btn-sm btn-secondary">
            <Edit3 size={15} /> Edit List
          </button>
          <button onClick={() => downloadPDF(listData, user)} className="btn btn-sm btn-elec">
            <Download size={15} /> Download PDF
          </button>
          <button onClick={() => printPDFInNewTab(listData, user)} className="btn btn-sm btn-primary">
            <Printer size={15} /> Print Sheet
          </button>
        </div>
      </div>

      <PDFDocument
        listData={listData}
        userProfile={user}
        onClose={() => navigate('/my-lists')}
      />
    </div>
  );
};

export default ListDetail;
