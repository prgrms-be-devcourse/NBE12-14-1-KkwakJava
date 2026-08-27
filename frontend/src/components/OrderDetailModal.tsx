'use client';

import React, { useState } from 'react';
import type { OrderResponse, OrderUpdateRequest } from '@/types/order';

interface Props {
  order: OrderResponse;
  onClose: () => void;
  onUpdate: (orderId: number, data: OrderUpdateRequest) => Promise<void>;
  onDelete: (orderId: number) => Promise<void>;
}

export default function OrderDetailModal({ order, onClose, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(order.address);
  const [postalCode, setPostalCode] = useState(order.postalCode);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!postalCode.trim() || !address.trim()) {
      alert('우편번호와 주소를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const updateData: OrderUpdateRequest = {
        postalCode,
        address,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await onUpdate(order.orderId, updateData);
      setIsEditing(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`주문 #${order.orderId}번을 정말 삭제하시겠습니까?`)) return;
    try {
      setLoading(true);
      await onDelete(order.orderId);
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.replace('T', ' ').slice(0, 16);
      return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#2b2523', fontWeight: 700 }}>
              주문 상세 정보 (#{order.orderId})
            </h3>
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#2b2523', marginBottom: 16 }}>
            <p style={{ margin: 0 }}><strong>주문 일시:</strong> {formatDate(order.orderDate)}</p>
            <p style={{ margin: 0 }}><strong>주문자 이메일:</strong> {order.email}</p>
            <p style={{ margin: 0 }}><strong>총 주문 금액:</strong> {order.totalAmount.toLocaleString()}원</p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ebe7df', margin: '14px 0' }} />

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#2b2523', fontWeight: 600 }}>배송지 정보</h4>
            {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                      type="text"
                      placeholder="우편번호"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      style={inputStyle}
                  />
                  <input
                      type="text"
                      placeholder="상세주소"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={inputStyle}
                  />
                </div>
            ) : (
                <div style={{ fontSize: 14, color: '#4a443f', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ margin: 0 }}>우편번호: {order.postalCode}</p>
                  <p style={{ margin: 0 }}>주소: {order.address}</p>
                </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ebe7df', margin: '14px 0' }} />

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#2b2523', fontWeight: 600 }}>주문 상품 내역</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map((item) => (
                  <li
                      key={item.orderItemId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f9f8f6',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#2b2523',
                      }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&auto=format&fit=crop&q=60'}
                          alt="상품"
                          style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600 }}>{item.productName}</span>
                        <span style={{ color: '#8c857b', marginLeft: 6, fontSize: 13 }}>
                      × {item.quantity}개 ({item.unitPrice.toLocaleString()}원)
                    </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#523120' }}>
                  {item.itemTotalPrice.toLocaleString()}원
                </span>
                  </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} style={cancelBtnStyle} disabled={loading}>취소</button>
                  <button onClick={handleUpdate} style={primaryBtnStyle} disabled={loading}>
                    {loading ? '저장 중...' : '저장하기'}
                  </button>
                </>
            ) : (
                <>
                  <button onClick={handleDelete} style={dangerBtnStyle} disabled={loading}>삭제</button>
                  <button onClick={() => setIsEditing(true)} style={primaryBtnStyle} disabled={loading}>주소 수정</button>
                </>
            )}
          </div>
        </div>
      </div>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: 24,
  borderRadius: 12,
  width: 500,
  maxWidth: '90%',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 18,
  cursor: 'pointer',
  color: '#8c857b',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #d9d4cb',
  fontSize: 14,
  outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#4e2d1d',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};

const cancelBtnStyle: React.CSSProperties = {
  backgroundColor: '#ebe7df',
  color: '#333',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
};

const dangerBtnStyle: React.CSSProperties = {
  backgroundColor: '#dc2626',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};