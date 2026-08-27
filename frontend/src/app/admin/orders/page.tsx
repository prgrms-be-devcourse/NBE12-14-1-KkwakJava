'use client';

import React, { useEffect, useState } from 'react';
import type { OrderResponse, OrderUpdateRequest } from '@/types/order';
import { getOrders, updateOrder, deleteOrder, deleteOrders } from '@/api/orderApi';
import OrderDetailModal from '@/components/OrderDetailModal';

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (email?: string) => {
    try {
      setLoading(true);
      const data = await getOrders(email);
      setOrders(data);
      setSelectedIds([]);
      setCurrentPage(1); // 검색이나 조회 시 1페이지로 리셋
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchEmail);
  };

  // 전체 조회 핸들러 (검색어 초기화 후 전체 목록 요청)
  const handleResetSearch = () => {
    setSearchEmail('');
    fetchOrders();
  };

  const handleUpdate = async (orderId: number, data: OrderUpdateRequest) => {
    const updated = await updateOrder(orderId, data);
    alert('배송지 정보가 성공적으로 수정되었습니다.');
    setSelectedOrder(updated);
    fetchOrders(searchEmail);
  };

  const handleDelete = async (orderId: number) => {
    await deleteOrder(orderId);
    alert('주문이 삭제되었습니다.');
    setSelectedOrder(null);
    fetchOrders(searchEmail);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`선택한 ${selectedIds.length}개의 주문을 삭제하시겠습니까?`)) return;

    try {
      await deleteOrders(selectedIds);
      alert('선택한 주문들이 삭제되었습니다.');
      fetchOrders(searchEmail);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  // 현재 페이지 기준 전체 선택 토글
  const isCurrentPageAllSelected =
      currentOrders.length > 0 &&
      currentOrders.every((o) => selectedIds.includes(o.orderId));

  const handleSelectCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageOrderIds = currentOrders.map((o) => o.orderId);
    if (e.target.checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageOrderIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentPageOrderIds.includes(id)));
    }
  };

  const handleSelectRow = (orderId: number) => {
    setSelectedIds((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>
        {/* 상단 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: '#efebe4',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
          >
            📋
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2b2523', margin: 0 }}>주문 관리</h1>
            <p style={{ color: '#8c857b', fontSize: 13, marginTop: 3 }}>주문 내역을 확인하고 상태를 관리하세요.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* 주문 검색 사이드바 */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b2523', margin: '0 0 16px 0' }}>주문 검색</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>이메일</label>
              <input
                  type="text"
                  placeholder="이메일을 입력하세요"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  style={inputStyle}
              />
              <button type="submit" style={primaryBtnStyle} disabled={loading}>
                {loading ? '조회 중...' : '조회하기'}
              </button>
              <button
                  type="button"
                  onClick={handleResetSearch}
                  style={secondaryBtnStyle}
                  disabled={loading}
              >
                전체 조회
              </button>
            </form>
          </div>

          {/* 주문 목록 테이블 카드 */}
          <div style={{ ...cardStyle, flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#2b2523' }}>
              주문 목록 <span style={{ fontSize: 13, fontWeight: 400, color: '#8c857b' }}>총 {orders.length}건</span>
            </span>

              {selectedIds.length > 0 && (
                  <button
                      onClick={handleBatchDelete}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                  >
                    선택 삭제 ({selectedIds.length}건)
                  </button>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
              <tr style={{ borderBottom: '1px solid #ebe7df', color: '#6d665e', fontSize: 12, fontWeight: 600 }}>
                <th style={{ padding: '10px 8px', width: 36 }}>
                  <input
                      type="checkbox"
                      checked={isCurrentPageAllSelected}
                      onChange={handleSelectCurrentPage}
                  />
                </th>
                <th style={{ padding: '10px 8px' }}>주문번호</th>
                <th style={{ padding: '10px 8px' }}>주문일</th>
                <th style={{ padding: '10px 8px' }}>고객 이메일</th>
                <th style={{ padding: '10px 8px' }}>주문 상품</th>
                <th style={{ padding: '10px 8px' }}>총 금액</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>관리</th>
              </tr>
              </thead>
              <tbody>
              {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#a0998f', fontSize: 14 }}>
                      조회된 주문 내역이 없습니다.
                    </td>
                  </tr>
              ) : (
                  currentOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    const itemSummary =
                        order.items?.length > 1
                            ? `${firstItem?.productName || '상품'} 외 ${order.items.length - 1}건`
                            : `${firstItem?.productName || '상품'} ${firstItem?.quantity || 1}개`;

                    return (
                        <tr
                            key={order.orderId}
                            style={{ borderBottom: '1px solid #f2eee8', fontSize: 13, color: '#2b2523' }}
                        >
                          <td style={{ padding: '14px 8px' }}>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(order.orderId)}
                                onChange={() => handleSelectRow(order.orderId)}
                            />
                          </td>
                          <td style={{ padding: '14px 8px', fontWeight: 700 }}>#{order.orderId}</td>
                          <td style={{ padding: '14px 8px', color: '#4a443f' }}>{formatDate(order.orderDate)}</td>
                          <td style={{ padding: '14px 8px', color: '#2b2523' }}>{order.email}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                  src={
                                      firstItem?.imageUrl ||
                                      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&auto=format&fit=crop&q=60'
                                  }
                                  alt="상품"
                                  style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }}
                              />
                              <span style={{ fontWeight: 500 }}>{itemSummary}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: '#2b2523' }}>
                            {order.totalAmount.toLocaleString()}원
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                            <button
                                onClick={() => setSelectedOrder(order)}
                                style={detailBtnStyle}
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                    );
                  })
              )}
              </tbody>
            </table>

            {/* 페이지네이션 바 */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 }}>
                  <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        ...pageBtnStyle,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.4 : 1,
                      }}
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            ...pageBtnStyle,
                            backgroundColor: currentPage === pageNum ? '#4e2d1d' : '#ffffff',
                            color: currentPage === pageNum ? '#ffffff' : '#4a443f',
                            borderColor: currentPage === pageNum ? '#4e2d1d' : '#dfdad0',
                            fontWeight: currentPage === pageNum ? 700 : 500,
                          }}
                      >
                        {pageNum}
                      </button>
                  ))}

                  <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        ...pageBtnStyle,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.4 : 1,
                      }}
                  >
                    다음
                  </button>
                </div>
            )}
          </div>
        </div>

        {selectedOrder && (
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        )}
      </div>
  );
}

const cardStyle: React.CSSProperties = {
  width: 260,
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: 12,
  border: '1px solid #e9e5dc',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
};

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: 6,
  border: '1px solid #d9d4cb',
  fontSize: 13,
  outline: 'none',
  color: '#2b2523',
  backgroundColor: '#fff',
};

const primaryBtnStyle: React.CSSProperties = {
  marginTop: 6,
  backgroundColor: '#4e2d1d',
  color: '#ffffff',
  border: 'none',
  padding: '10px 0',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#f6f4f0',
  color: '#4a443f',
  border: '1px solid #dfdad0',
  padding: '9px 0',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};

const detailBtnStyle: React.CSSProperties = {
  background: '#f6f4f0',
  color: '#4a443f',
  border: '1px solid #dfdad0',
  padding: '5px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const pageBtnStyle: React.CSSProperties = {
  border: '1px solid #dfdad0',
  background: '#fff',
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 13,
  minWidth: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};