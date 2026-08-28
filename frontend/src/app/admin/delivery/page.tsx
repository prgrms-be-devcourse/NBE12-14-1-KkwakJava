'use client';

import {useEffect, useState} from 'react';
import type {DeliveryOrderResponse} from '@/types/delivery';
import {getDeliveryOrders} from '@/api/deliveryApi';

const ITEMS_PER_PAGE = 5;

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrderResponse[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 주문일 표시
  const formatOrderDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return (
        `${date.getFullYear()}. ` +
        `${String(date.getMonth() + 1).padStart(2, '0')}. ` +
        `${String(date.getDate()).padStart(2, '0')} ` +
        `${String(date.getHours()).padStart(2, '0')}:` +
        `${String(date.getMinutes()).padStart(2, '0')}`
    );
  };

  // 배송 전체 조회
  // 이메일이 있으면 전체 배송 중 해당 이메일만 조회
  const fetchDeliveryOrders = async (email?: string) => {
    try {
      setLoading(true);

      // 백엔드에서 14시 기준으로 계산된 전체 배송 목록 조회
      const data = await getDeliveryOrders();

      const searchEmail =
          email?.trim().toLowerCase();

      // 이메일이 있으면 해당 이메일만 필터링
      if (searchEmail) {
        const filteredData = data.filter(
            (order) =>
                order.email.toLowerCase() === searchEmail
        );

        setOrders(filteredData);
      } else {
        // 이메일이 없으면 전체 조회
        setOrders(data);
      }

      // 조회할 때마다 첫 페이지로 이동
      setCurrentPage(1);

    } catch (e: any) {
      alert(e.message);

    } finally {
      setLoading(false);
    }
  };

  // 페이지 진입 시 전체 배송 조회
  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  // 이메일 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // 이메일이 있으면 해당 이메일 조회
    // 비어 있으면 전체 조회
    fetchDeliveryOrders(searchEmail);
  };

  // 전체 조회
  const handleResetSearch = () => {
    // 검색어 초기화
    setSearchEmail('');

    // 전체 배송 조회
    fetchDeliveryOrders();
  };

  // 배송 완료 건수
  const completedCount = orders.filter(
      (order) => order.deliveryCompleted
  ).length;

  // ================= 페이징 =================

  const totalPages =
      Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;

  const currentOrders = orders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
      <div className="w-full px-8 py-8">

        {/* ================= 페이지 제목 ================= */}
        <div className="mb-7 flex items-center gap-4">

          <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EFEAE4] text-2xl">
            🚚
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#2B2523]">
              배송 관리
            </h1>

            <p className="mt-1 text-sm text-[#8C857B]">
              배송 대상 주문을 확인하세요.
            </p>
          </div>

        </div>

        {/* ================= 전체 영역 ================= */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">

          {/* ================= 왼쪽 배송 검색 ================= */}
          <aside className="rounded-xl border border-[#E9E5DC] bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-[#2B2523]">
              배송 검색
            </h2>

            <form
                onSubmit={handleSearch}
                className="mt-7"
            >

              <label className="mb-2 block text-sm font-semibold text-[#2B2523]">
                이메일
              </label>

              <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) =>
                      setSearchEmail(e.target.value)
                  }
                  placeholder="이메일을 입력하세요"
                  className="w-full rounded-lg border border-[#D9D4CB] bg-white px-3 py-3 text-sm text-[#2B2523] outline-none placeholder:text-[#AAA39A] focus:border-[#523120]"
              />

              {/* 조회하기 */}
              <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full rounded-lg bg-[#4E2D1D] py-3 text-sm font-semibold text-white transition hover:bg-[#523120] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                    ? '조회 중...'
                    : '조회하기'}
              </button>

              {/* 전체 조회 */}
              <button
                  type="button"
                  onClick={handleResetSearch}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-[#D9D4CB] bg-[#F6F4F0] py-3 text-sm font-semibold text-[#4A443F] transition hover:bg-[#EEEAE4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                전체 조회
              </button>

            </form>

          </aside>

          {/* ================= 오른쪽 ================= */}
          <section className="min-w-0">

            {/* ================= 요약 카드 ================= */}
            <div
                className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border border-[#E9E5DC] bg-white shadow-sm">

              {/* 조회된 배송 */}
              <div
                  className="flex items-center justify-center gap-5 border-r border-[#E9E5DC] py-7">

                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6F1EB] text-xl">
                  📦
                </div>

                <div>
                  <p className="text-xs text-[#8C857B]">
                    조회된 배송
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#523120]">
                    {orders.length}건
                  </p>
                </div>

              </div>

              {/* 배송 완료 */}
              <div className="flex items-center justify-center gap-5 py-7">

                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF5E9] text-xl font-bold text-green-700">
                  ✓
                </div>

                <div>
                  <p className="text-xs text-[#8C857B]">
                    배송 완료
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-700">
                    {completedCount}건
                  </p>
                </div>

              </div>

            </div>

            {/* ================= 배송 내역 ================= */}
            <div className="rounded-xl border border-[#E9E5DC] bg-white p-5 shadow-sm">

              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2B2523]">
                  배송 내역
                </h2>
              </div>

              {/* 결과 없음 */}
              {!loading && orders.length === 0 && (
                  <div className="py-24 text-center text-sm text-[#A0998F]">
                    조회된 배송 내역이 없습니다.
                  </div>
              )}

              {/* ================= 배송 카드 목록 ================= */}
              <div className="flex flex-col gap-4">

                {currentOrders.map((order) => {

                  // 해당 배송 묶음의 총 상품 수량
                  const orderTotalQuantity =
                      order.items.reduce(
                          (total, item) =>
                              total + item.quantity,
                          0
                      );

                  return (
                      <div
                          key={order.deliveryId}
                          className="overflow-hidden rounded-xl border border-[#E9E5DC] bg-white"
                      >

                        {/* ================= 카드 상단 ================= */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E5DC] bg-[#FCFBF9] px-5 py-4">

                          <div className="flex flex-wrap items-center gap-4">

                            {/* 배송 묶음의 대표 주문번호 */}
                            <strong className="text-sm text-[#2B2523]">
                              주문번호 #
                              {String(order.deliveryId).padStart(3, '0')}
                            </strong>

                            <div className="h-4 w-px bg-[#DDD8CF]"/>

                            <span className="text-xs text-[#8C857B]">
                          주문일
                        </span>

                            <span className="text-sm font-semibold text-[#2B2523]">
                          {formatOrderDate(order.orderDate)}
                        </span>

                          </div>

                          {/* 배송 완료 */}
                          {order.deliveryCompleted && (
                              <span
                                  className="rounded-md border border-[#CFE1C8] bg-[#EDF5E9] px-3 py-1 text-xs font-bold text-green-700">
                          배송 완료
                        </span>
                          )}

                        </div>

                        {/* ================= 카드 본문 ================= */}
                        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">

                          {/* ================= 고객 정보 ================= */}
                          <div className="border-b border-[#E9E5DC] p-5 xl:border-b-0 xl:border-r">

                            <div className="flex flex-col gap-5">

                              <div>
                                <p className="text-xs text-[#8C857B]">
                                  이메일
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-[#2B2523]">
                                  {order.email}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-[#8C857B]">
                                  배송지
                                </p>

                                <p className="mt-1 text-xs text-[#8C857B]">
                                  ({order.postalCode})
                                </p>

                                <p className="mt-1 break-words text-sm leading-6 text-[#2B2523]">
                                  {order.address}
                                </p>
                              </div>

                            </div>

                          </div>

                          {/* ================= 상품 정보 ================= */}
                          <div className="min-w-0 p-5">

                            {/* 상품 헤더 */}
                            <div
                                className="grid grid-cols-[minmax(0,1fr)_90px_120px] border-b border-[#E9E5DC] pb-3 text-xs font-bold text-[#2B2523]">

                          <span>
                            주문 상품
                          </span>

                              <span className="text-right">
                            수량
                          </span>

                              <span className="text-right">
                            가격
                          </span>

                            </div>

                            {/* 상품 목록 */}
                            <div className="divide-y divide-[#F2EEE8]">

                              {order.items.map((item) => (
                                  <div
                                      key={item.productId}
                                      className="grid grid-cols-[minmax(0,1fr)_90px_120px] items-center py-4"
                                  >

                                    {/* 상품명 + 이미지 */}
                                    <div className="flex min-w-0 items-center gap-3">

                                      <div
                                          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F6F1EB]">

                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="flex h-full w-full items-center justify-center">
                                              ☕
                                            </div>
                                        )}

                                      </div>

                                      <div className="min-w-0">

                                        <p className="truncate text-sm font-medium text-[#2B2523]">
                                          {item.productName}
                                        </p>

                                      </div>

                                    </div>

                                    {/* 수량 */}
                                    <span
                                        className="text-right text-sm font-semibold text-[#2B2523]">
                                {item.quantity}개
                              </span>

                                    {/* 가격 */}
                                    <span
                                        className="text-right text-sm font-semibold text-[#2B2523]">
                                {item.itemTotalPrice.toLocaleString()}원
                              </span>

                                  </div>
                              ))}

                            </div>

                            {/* ================= 합계 ================= */}
                            <div
                                className="flex flex-wrap items-center justify-end gap-8 border-t border-[#E9E5DC] pt-4">

                              <div className="flex items-center gap-3">

                            <span className="text-sm text-[#8C857B]">
                              총 수량
                            </span>

                                <strong className="text-sm text-[#2B2523]">
                                  {orderTotalQuantity}개
                                </strong>

                              </div>

                              <div className="flex items-center gap-3">

                            <span className="text-sm text-[#8C857B]">
                              총 금액
                            </span>

                                <strong className="text-base text-[#523120]">
                                  {order.totalAmount.toLocaleString()}원
                                </strong>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                  );
                })}

              </div>

              {/* ================= 페이지네이션 ================= */}
              {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">

                    {/* 이전 */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.max(page - 1, 1)
                            )
                        }
                        disabled={currentPage === 1}
                        className="h-8 rounded-md border border-[#DFDAD0] bg-white px-3 text-sm text-[#4A443F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from(
                        {length: totalPages},
                        (_, index) => index + 1
                    ).map((pageNumber) => (

                        <button
                            type="button"
                            key={pageNumber}
                            onClick={() =>
                                setCurrentPage(pageNumber)
                            }
                            className={
                              currentPage === pageNumber
                                  ? 'flex h-8 min-w-8 items-center justify-center rounded-md border border-[#4E2D1D] bg-[#4E2D1D] px-2 text-sm font-bold text-white'
                                  : 'flex h-8 min-w-8 items-center justify-center rounded-md border border-[#DFDAD0] bg-white px-2 text-sm text-[#4A443F]'
                            }
                        >
                          {pageNumber}
                        </button>

                    ))}

                    {/* 다음 */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.min(page + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 rounded-md border border-[#DFDAD0] bg-white px-3 text-sm text-[#4A443F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      다음
                    </button>

                  </div>
              )}

              {/* 안내 */}
              {orders.length > 0 && (
                  <p className="mt-5 text-xs text-[#A0998F]">
                    ⓘ 배송 대상은 전날 오후 2시부터 당일 오후 2시 이전 주문을 기준으로 조회됩니다.
                  </p>
              )}

            </div>

          </section>

        </div>

      </div>
  );
}