import React, { useState } from 'react';
import { Plus, Minus, Check, Tag } from 'lucide-react';

const ItemCard = ({ item, onAdd, addedQuantity = 0 }) => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddClick = () => {
    onAdd(item, quantity);
  };

  const isPlumbing = item.item_type === 'plumbing';

  return (
    <div className="glass-card item-card-box" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.75rem',
      position: 'relative',
      borderLeft: `4px solid ${isPlumbing ? '#0d9488' : '#d97706'}`,
      minWidth: 0,
      width: '100%',
      boxSizing: 'border-box',
      padding: '1rem'
    }}>
      {/* Top Details */}
      <div style={{ minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '0.4rem', 
          marginBottom: '0.4rem', 
          flexWrap: 'wrap' 
        }}>
          <span className={`badge ${isPlumbing ? 'badge-plumb' : 'badge-elec'}`} style={{ fontSize: '0.68rem' }}>
            <Tag size={10} style={{ marginRight: '3px' }} />
            {item.category}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {addedQuantity > 0 && (
              <span style={{
                background: isPlumbing ? '#0d9488' : '#d97706',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.15rem 0.45rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Check size={11} /> {addedQuantity} in list
              </span>
            )}
            <span className="mono" style={{ 
              fontSize: '0.7rem', 
              color: '#94a3b8', 
              background: '#0f172a', 
              padding: '0.12rem 0.35rem', 
              borderRadius: '4px', 
              border: '1px solid #334155' 
            }}>
              {item.item_code}
            </span>
          </div>
        </div>

        <h4 style={{ 
          fontSize: '0.98rem', 
          fontWeight: 700, 
          color: '#f8fafc', 
          marginBottom: '0.2rem', 
          lineHeight: 1.35,
          wordBreak: 'break-word'
        }}>
          {item.name}
        </h4>

        {item.description && (
          <p style={{ 
            fontSize: '0.76rem', 
            color: '#94a3b8', 
            lineHeight: 1.4,
            wordBreak: 'break-word' 
          }}>
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom Action Area: Unit, Stepper & Add Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '0.5rem', 
        paddingTop: '0.65rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.06)' 
      }}>
        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, flexShrink: 0 }}>
          Unit: <span style={{ color: isPlumbing ? '#2dd4bf' : '#fbbf24' }}>{item.unit}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Stepper */}
          <div className="quantity-stepper" style={{ height: '32px' }}>
            <button 
              type="button" 
              onClick={handleDecrease} 
              className="quantity-btn" 
              style={{ width: '30px', height: '30px', minWidth: '30px' }}
              title="Decrease" 
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="quantity-input"
              style={{ width: '36px', height: '30px', fontSize: '0.85rem' }}
              aria-label="Item quantity"
            />
            <button 
              type="button" 
              onClick={handleIncrease} 
              className="quantity-btn" 
              style={{ width: '30px', height: '30px', minWidth: '30px' }}
              title="Increase" 
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className={`btn btn-sm ${isPlumbing ? 'btn-plumb' : 'btn-elec'}`}
            style={{ padding: '0.4rem 0.75rem', height: '32px', fontSize: '0.8rem' }}
            title="Add item to list"
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
