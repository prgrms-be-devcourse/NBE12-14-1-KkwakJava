'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {DeliveryOrderResponse} from '@/types/delivery';
import {getDeliveryOrders} from '@/api/deliveryApi';

const ITEMS_PER_PAGE = 5;

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrderResponse[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // 마지막 주문일 표시
  const formatOrderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
        `${date.getFullYear()}. ` +
        `${String(date.getMonth() + 1).padStart(2, '0')}. ` +
        `${String(date.getDate()).padStart(2, '0')} `
    );
  };

  // 배송 전체 조회 / 이메일이 있으면 해당 이메일만 조회
  const fetchDeliveryOrders = async (email?: string) => {
    try {
      setLoading(true);
      const data = await getDeliveryOrders();
      const trimmedEmail = email?.trim().toLowerCase();

      if (trimmedEmail) {
        const filteredData = data.filter((order) => order.email.toLowerCase() === trimmedEmail);
        setOrders(filteredData);
      } else {
        setOrders(data);
      }

      setCurrentPage(1);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 관리자 배송관리 페이지 진입 시 전체 배송 조회하기
  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  // 이메일 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveryOrders(searchEmail);
  };

  // 전체 조회
  const handleResetSearch = () => {
    setSearchEmail('');
    fetchDeliveryOrders();
  };

  // 해당 고객의 주문 내역으로 이동
  const handleOrderDetails = (email: string) => {
    router.push(`/admin/orders?email=${encodeURIComponent(email)}`);
  };

  // 배송 완료 검수
  const completedCount = orders.filter((order) => order.deliveryCompleted).length;

  // ================= 페이징하기 =================
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
      <div className="max-w-[1200px] mx-auto py-9 px-6">
        {/* ================= 배송 관리 페이지 ================= */}
        <div className="mb-7 flex items-center gap-4">
          <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F6F5F2] text-2xl">
            🚚
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2B2523]">배송 관리</h1>
            <p className="mt-1 text-xs text-[#8C857B]">배송 현황을 확인하고 관리하세요.</p>
          </div>
        </div>

        {/* ================ 전체 화면 ================ */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* ================= 왼쪽에 배송 검색칸 ================= */}
          {/* 배송 검색 사이드바 */}
          <aside className="bg-white p-5 rounded-xl border border-[#E9E5DC] shadow-sm">
            <h2 className="text-sm font-bold text-[#2B2523] mb-4">배송 검색</h2>

            <form onSubmit={handleSearch} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-600">이메일</label>
              <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="px-3 py-2 rounded-md border border-[#D9D4CB] text-xs text-[#2B2523] bg-white focus:outline-none focus:border-[#4E2D1D]"
              />
              <button
                  type="submit"
                  disabled={loading}
                  className="mt-1.5 bg-[#4E2D1D] hover:bg-[#3B2216] text-white py-2.5 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? '조회 중...' : '조회하기'}
              </button>
              <button
                  type="button"
                  onClick={handleResetSearch}
                  disabled={loading}
                  className="bg-[#F6F4F0] hover:bg-[#EAE5DD] text-[#4A443F] border border-[#DFDAD0] py-2 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                전체 조회
              </button>
            </form>
          </aside>

          {/* ================= 오른쪽에 배송내역 칸 ================= */}
          <section className="min-w-0">
            {/* ================= 조회된 배송 | 배송 완료 ================= */}
            <div
                className="mb-4 rounded-xl border border-[#E9E5DC] bg-[#FFFFFF] p-4 shadow-sm flex items-center justify-around">
              <div className="flex items-center gap-3.5 flex-1 justify-center">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F5F2] text-lg">
                  📦
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#8C857B]">조회된 배송</span>
                  <span className="text-lg font-bold text-[#523120]">
                      {orders.length}
                    <span className="ml-0.5 text-sm font-semibold">건</span>
                    </span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-[#E9E5DC]"/>

              <div className="flex items-center gap-3.5 flex-1 justify-center">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF5E9] text-lg font-bold text-green-700">
                  ✓
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#8C857B]">배송 완료</span>
                  <span className="text-lg font-bold text-green-700">
                      {completedCount}
                    <span className="ml-0.5 text-sm font-semibold">건</span>
                    </span>
                </div>
              </div>
            </div>

            {/* ================= 배송 내역 ================= */}
            <div className="rounded-xl border border-[#E9E5DC] bg-[#FFFFFF] p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2B2523]">배송 내역</h2>
              </div>

              {/* 조회된 배송 내역이 없을 시*/}
              {!loading && orders.length === 0 && (
                  <div className="py-24 text-center text-sm text-[#A0998F]">조회된 배송 내역이 없습니다.</div>
              )}

              {/* ================= 배송 내역 목록 ================= */}
              <div className="flex flex-col gap-4">
                {currentOrders.map((order) => {
                  const orderTotalQuantity = order.items.reduce(
                      (total, item) => total + item.quantity,
                      0
                  );

                  return (
                      <div key={order.deliveryId}
                           className="overflow-hidden rounded-xl border border-[#E9E5DC] bg-[#FFFFFF]">

                        {/* ================= 배송 내역란에 주문한 1건 상단바 ================= */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E5DC] bg-[#F6F5F2] px-5 py-4">
                          <div className="flex flex-wrap items-center gap-4">
                            <strong className="text-sm text-[#2B2523]">
                              주문번호 #{String(order.deliveryId).padStart(3, '0')}
                            </strong>
                            <div className="h-4 w-px bg-[#E9E5DC]"/>
                            <span className="text-xs text-[#8C857B]">마지막 주문일</span>
                            <span className="text-sm font-semibold text-[#2B2523]">
                              {formatOrderDate(order.orderDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {order.deliveryCompleted && (<span
                                    className="rounded-md border border-[#CFE1C8] bg-[#EDF5E9] px-3 py-1 text-xs font-bold text-green-700">
                              배송 완료
                            </span>
                            )}

                            <button type="button" onClick={() => handleOrderDetails(order.email)}
                                    className="rounded-md border border-[#E9E5DC] bg-[#F6F4F0] px-3 py-1 text-xs font-semibold text-[#4A443F] transition hover:bg-[#E9E5DC]">
                              주문 내역
                            </button>
                          </div>
                        </div>

                        {/* ================= 배송 내역란에 주문 1건당 내부정보 ================= */}
                        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
                          {/* 고객 정보 */}
                          <div
                              className="border-b border-[#E9E5DC] p-5 xl:border-b-0 xl:border-r">
                            <div className="flex flex-col gap-5">
                              <div>
                                <p className="text-xs text-[#8C857B]">이메일</p>
                                <p className="mt-1 break-all text-sm font-medium text-[#2B2523]">{order.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#8C857B]">배송지</p>
                                <p className="mt-1 text-xs text-[#8C857B]">({order.postalCode})</p>
                                <p className="mt-1 break-words text-sm leading-6 text-[#2B2523]">{order.address}</p>
                              </div>
                            </div>
                          </div>

                          {/* 주문한 상품 정보 */}
                          <div className="min-w-0 p-5">
                            <div
                                className="grid grid-cols-[minmax(0,1fr)_90px_120px] border-b border-[#E9E5DC] pb-3 text-xs font-bold text-[#2B2523]">
                              <span>주문 상품</span>
                              <span className="text-right">수량</span>
                              <span className="text-right">가격</span>
                            </div>

                            <div className="divide-y divide-[#E9E5DC]">
                              {order.items.map((item) => (
                                  <div key={item.productId}
                                       className="grid grid-cols-[minmax(0,1fr)_90px_120px] items-center py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div
                                          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F6F5F2]">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName}
                                                 className="h-full w-full object-cover"/>
                                        ) : (
                                            <div
                                                className="flex h-full w-full items-center justify-center">☕</div>
                                        )}
                                      </div>
                                      <p className="min-w-0 truncate text-sm font-medium text-[#2B2523]">{item.productName}</p>
                                    </div>
                                    <span
                                        className="text-right text-sm font-semibold text-[#2B2523]">{item.quantity}개</span>
                                    <span
                                        className="text-right text-sm font-semibold text-[#2B2523]">{item.itemTotalPrice.toLocaleString()}원</span>
                                  </div>
                              ))}
                            </div>

                            {/*  합계(총 수량, 금액) */}
                            <div
                                className="flex flex-wrap items-center justify-end gap-8 border-t border-[#E9E5DC] pt-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-[#8C857B]">총 수량</span>
                                <strong
                                    className="text-sm text-[#2B2523]">{orderTotalQuantity}개</strong>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-[#8C857B]">총 금액</span>
                                <strong
                                    className="text-base text-[#523120]">{order.totalAmount.toLocaleString()}원</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>

              {/* ================= 페이징 ================= */}
              {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 rounded-md border border-[#E9E5DC] bg-[#F6F4F0] px-3 text-sm text-[#4A443F] disabled:cursor-not-allowed disabled:opacity-40">
                      이전
                    </button>

                    {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNumber) => (
                        <button
                            type="button"
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={
                              currentPage === pageNumber
                                  ? 'flex h-8 min-w-8 items-center justify-center rounded-md border border-[#4E2D1D] bg-[#4E2D1D] px-2 text-sm font-bold text-white'
                                  : 'flex h-8 min-w-8 items-center justify-center rounded-md border border-[#E9E5DC] bg-[#F6F4F0] px-2 text-sm text-[#4A443F]'
                            }>
                          {pageNumber}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 rounded-md border border-[#E9E5DC] bg-[#F6F4F0] px-3 text-sm text-[#4A443F] disabled:cursor-not-allowed disabled:opacity-40">
                      다음
                    </button>
                  </div>
              )}

            </div>
          </section>
        </div>
      </div>
  );
}
