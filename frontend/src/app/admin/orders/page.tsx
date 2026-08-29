'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { OrderResponse, OrderUpdateRequest } from '@/types/order';
import { getOrders, updateOrder, deleteOrder, deleteOrders } from '@/api/orderApi';
import OrderDetailModal from '@/components/admin/order/OrderDetailModal';

const ITEMS_PER_PAGE = 10;

const checkIsDelivered = (orderDateStr: string): boolean => {
  if (!orderDateStr) return false;
  const orderDate = new Date(orderDateStr);
  const now = new Date();

  const cutoff = new Date(orderDate);
  if (orderDate.getHours() < 14) {
    cutoff.setHours(14, 0, 0, 0);
  } else {
    cutoff.setDate(cutoff.getDate() + 1);
    cutoff.setHours(14, 0, 0, 0);
  }

  return now >= cutoff;
};

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get('email') || '';

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [searchEmail, setSearchEmail] = useState(urlEmail);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (email?: string) => {
    try {
      setLoading(true);
      const data = await getOrders(email);
      // 주문번호(orderId) 기준 내림차순 정렬 (최신순)
      const sortedData = [...data].sort((a, b) => b.orderId - a.orderId);
      setOrders(sortedData);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '주문 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchEmail(urlEmail);
    fetchOrders(urlEmail);
  }, [urlEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      router.push(`/admin/orders?email=${encodeURIComponent(searchEmail.trim())}`);
    } else {
      router.push('/admin/orders');
    }
  };

  const handleResetSearch = () => {
    setSearchEmail('');
    router.push('/admin/orders');
  };

  const handleUpdate = async (orderId: number, data: OrderUpdateRequest) => {
    const updated = await updateOrder(orderId, data);
    alert('배송지 정보가 성공적으로 수정되었습니다.');
    setSelectedOrder(updated);
    fetchOrders(urlEmail);
  };

  const handleDelete = async (orderId: number) => {
    await deleteOrder(orderId);
    alert('주문이 삭제되었습니다.');
    setSelectedOrder(null);
    fetchOrders(urlEmail);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    const deliveredSelected = orders.filter(
        (o) => selectedIds.includes(o.orderId) && checkIsDelivered(o.orderDate)
    );
    if (deliveredSelected.length > 0) {
      alert('배송 완료된 주문은 삭제할 수 없습니다. 선택 항목을 확인해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개의 주문을 삭제하시겠습니까?`)) return;

    try {
      await deleteOrders(selectedIds);
      alert('선택한 주문들이 삭제되었습니다.');
      fetchOrders(urlEmail);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '주문 삭제에 실패했습니다.');
    }
  };

  const totalCount = orders.length;
  const completedCount = orders.filter((o) => checkIsDelivered(o.orderDate)).length;

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

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
      <div className="max-w-[1200px] mx-auto py-9 px-6">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 bg-[#efebe4] rounded-[10px] flex items-center justify-center text-[22px]">
            📋
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2b2523] m-0">주문 관리</h1>
            <p className="text-[#8c857b] text-xs mt-1">주문 내역을 확인하고 배송 및 주문 상태를 관리하세요.</p>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* 주문 검색 사이드바 */}
          <div className="w-[260px] bg-white p-5 rounded-xl border border-[#e9e5dc] shadow-sm shrink-0">
            <h2 className="text-sm font-bold text-[#2b2523] mb-4">주문 검색</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-600">이메일</label>
              <input
                  type="text"
                  placeholder="이메일을 입력하세요"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="px-3 py-2 rounded-md border border-[#d9d4cb] text-xs text-[#2b2523] bg-white focus:outline-none focus:border-[#4e2d1d]"
              />
              <button
                  type="submit"
                  disabled={loading}
                  className="mt-1.5 bg-[#4e2d1d] hover:bg-[#3b2216] text-white py-2.5 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? '조회 중...' : '조회하기'}
              </button>
              <button
                  type="button"
                  onClick={handleResetSearch}
                  disabled={loading}
                  className="bg-[#f6f4f0] hover:bg-[#eae5dd] text-[#4a443f] border border-[#dfdad0] py-2 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                전체 조회
              </button>
            </form>
          </div>

          {/* 메인 영역 */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* 상단 통계 카드 위젯 */}
            <div className="bg-white rounded-xl border border-[#e9e5dc] p-4 shadow-sm flex items-center justify-around">
              <div className="flex items-center gap-3.5 flex-1 justify-center">
                <div className="w-10 h-10 rounded-full bg-[#f6f1eb] flex items-center justify-center text-[#523120] text-lg">
                  🛍️
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#8c857b] font-medium">조회된 주문</span>
                  <span className="text-lg font-bold text-[#2b2523]">
                  {totalCount}
                    <span className="text-sm font-semibold ml-0.5">건</span>
                </span>
                </div>
              </div>

              <div className="w-[1px] h-8 bg-[#eae7e1]"></div>

              <div className="flex items-center gap-3.5 flex-1 justify-center">
                <div className="w-10 h-10 rounded-full bg-[#edf7ee] flex items-center justify-center text-[#2e7d32] text-lg">
                  ✓
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#8c857b] font-medium">배송 완료</span>
                  <span className="text-lg font-bold text-[#2e7d32]">
                  {completedCount}
                    <span className="text-sm font-semibold ml-0.5">건</span>
                </span>
                </div>
              </div>
            </div>

            {/* 주문 목록 테이블 카드 */}
            <div className="bg-white p-6 rounded-xl border border-[#e9e5dc] shadow-sm flex flex-col">
              <div className="mb-4 flex justify-between items-center">
              <span className="text-sm font-bold text-[#2b2523]">
                주문 목록 <span className="text-xs font-normal text-[#8c857b]">총 {orders.length}건</span>
              </span>

                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBatchDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      선택 삭제 ({selectedIds.length}건)
                    </button>
                )}
              </div>

              <table className="w-full border-collapse text-left table-auto">
                <thead>
                <tr className="border-b border-[#ebe7df] text-[#6d665e] text-xs font-semibold whitespace-nowrap">
                  <th className="py-2.5 px-2 w-9 text-center">
                    <input
                        type="checkbox"
                        checked={isCurrentPageAllSelected}
                        onChange={handleSelectCurrentPage}
                        className="accent-[#4e2d1d] cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-2">주문번호</th>
                  <th className="py-2.5 px-2">주문일</th>
                  <th className="py-2.5 px-2">고객 이메일</th>
                  <th className="py-2.5 px-2">주문 상품</th>
                  <th className="py-2.5 px-2 text-right">총 금액</th>
                  <th className="py-2.5 px-2 text-center w-20">관리</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#f2eee8]">
                {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#a0998f] text-sm">
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
                              className="text-xs text-[#2b2523] hover:bg-[#faf8f5] transition-colors"
                          >
                            <td className="py-3 px-2 text-center align-middle">
                              <input
                                  type="checkbox"
                                  checked={selectedIds.includes(order.orderId)}
                                  onChange={() => handleSelectRow(order.orderId)}
                                  className="accent-[#4e2d1d] cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-2 font-bold whitespace-nowrap align-middle">
                              #{order.orderId}
                            </td>
                            <td className="py-3 px-2 text-[#4a443f] whitespace-nowrap align-middle">
                              {formatDate(order.orderDate)}
                            </td>
                            <td className="py-3 px-2 text-[#2b2523] whitespace-nowrap align-middle">
                              {order.email}
                            </td>
                            <td className="py-3 px-2 align-middle">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                    src={
                                        firstItem?.imageUrl ||
                                        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&auto=format&fit=crop&q=60'
                                    }
                                    alt="상품"
                                    className="w-8 h-8 rounded-md object-cover border border-neutral-200 shrink-0"
                                />
                                <span className="font-medium truncate">{itemSummary}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 font-bold text-[#2b2523] text-right whitespace-nowrap align-middle">
                              {order.totalAmount.toLocaleString()}원
                            </td>
                            <td className="py-3 px-2 text-center align-middle whitespace-nowrap">
                              <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="bg-[#f6f4f0] hover:bg-[#eae5dd] text-[#4a443f] border border-[#dfdad0] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer"
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

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-6">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="border border-[#dfdad0] bg-white text-[#4a443f] rounded-md px-3 py-1.5 text-xs min-w-[32px] h-8 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f4f0] transition-colors cursor-pointer"
                    >
                      이전
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`border rounded-md px-3 py-1.5 text-xs min-w-[32px] h-8 flex items-center justify-center transition-colors cursor-pointer ${
                                currentPage === pageNum
                                    ? 'bg-[#4e2d1d] text-white border-[#4e2d1d] font-bold'
                                    : 'bg-white text-[#4a443f] border-[#dfdad0] hover:bg-[#f6f4f0]'
                            }`}
                        >
                          {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="border border-[#dfdad0] bg-white text-[#4a443f] rounded-md px-3 py-1.5 text-xs min-w-[32px] h-8 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f4f0] transition-colors cursor-pointer"
                    >
                      다음
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {selectedOrder && (
            <OrderDetailModal
                order={selectedOrder}
                isDelivered={checkIsDelivered(selectedOrder.orderDate)}
                onClose={() => setSelectedOrder(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        )}
      </div>
  );
}

export default function AdminOrdersPage() {
  return (
      <Suspense fallback={<div className="p-10 text-center text-sm text-neutral-500">로딩 중...</div>}>
        <AdminOrdersContent />
      </Suspense>
  );
}