'use client';

import React, { useState } from 'react';
import type { OrderResponse, OrderUpdateRequest } from '@/types/order';

interface OrderDetailModalProps {
  order: OrderResponse;
  isDelivered: boolean;
  onClose: () => void;
  onUpdate: (orderId: number, data: OrderUpdateRequest) => Promise<void>;
  onDelete: (orderId: number) => Promise<void>;
}

export default function OrderDetailModal({
                                           order,
                                           isDelivered,
                                           onClose,
                                           onUpdate,
                                           onDelete,
                                         }: OrderDetailModalProps) {
  const [postalCode, setPostalCode] = useState(order.postalCode || '');
  const [address, setAddress] = useState(order.address || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!postalCode.trim() || !address.trim()) {
      alert('우편번호와 주소를 모두 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      await onUpdate(order.orderId, {
        postalCode,
        address,
        items:
            order.items?.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })) || [],
      });
      setIsEditing(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 주문을 삭제하시겠습니까?')) return;
    try {
      setLoading(true);
      await onDelete(order.orderId);
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
      <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-[560px] rounded-2xl p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          {/* 상단 닫기 버튼 */}
          <button
              onClick={onClose}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 text-xl font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>

          {/* 헤더 */}
          <div className="border-b border-[#eae7e1] pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#2b2523]">주문 상세 정보</span>
              <span className="bg-[#efebe4] text-[#523120] text-xs font-bold px-2 py-0.5 rounded">
                #{order.orderId}
              </span>
              {isDelivered && (
                  <span className="bg-[#edf7ee] text-[#2e7d32] text-xs font-bold px-2 py-0.5 rounded">
                  배송 완료
                </span>
              )}
            </div>
            <p className="text-xs text-[#8c857b] mt-1">주문일자: {formatDate(order.orderDate)}</p>
          </div>

          {/* 고객 정보 */}
          <div className="bg-[#f9f8f6] p-4 rounded-xl border border-[#ece8e1] mb-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-[#523120]">주문자 및 배송지 정보</h3>
              {isDelivered && (
                  <span className="text-[11px] font-semibold text-[#8c857b]">
                ※ 배송 완료된 주문은 배송지를 변경할 수 없습니다.
              </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-y-2.5 text-xs">
              <span className="text-neutral-500 font-medium">고객 이메일</span>
              <span className="col-span-2 font-semibold text-[#2b2523]">{order.email}</span>

              <span className="text-neutral-500 font-medium">우편번호</span>
              <div className="col-span-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#d9d4cb] bg-white focus:outline-none focus:border-[#523120]"
                    />
                ) : (
                    <span className="font-semibold text-[#2b2523]">{order.postalCode || '-'}</span>
                )}
              </div>

              <span className="text-neutral-500 font-medium">배송 주소</span>
              <div className="col-span-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#d9d4cb] bg-white focus:outline-none focus:border-[#523120]"
                    />
                ) : (
                    <span className="font-semibold text-[#2b2523]">{order.address || '-'}</span>
                )}
              </div>
            </div>

            {/* 배송 완료가 아닐 때만 수정 버튼 노출 */}
            {!isDelivered && (
                <div className="mt-4 flex justify-end gap-2">
                  {isEditing ? (
                      <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 text-xs rounded border border-[#dfdad0] bg-white text-[#4a443f] hover:bg-[#f6f4f0] transition-colors cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-3.5 py-1.5 text-xs rounded bg-[#523120] text-white font-semibold hover:bg-[#3d2417] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? '저장 중...' : '저장 완료'}
                        </button>
                      </>
                  ) : (
                      <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1.5 text-xs rounded border border-[#dfdad0] bg-white text-[#4a443f] hover:bg-[#f6f4f0] font-medium transition-colors cursor-pointer"
                      >
                        배송지 수정
                      </button>
                  )}
                </div>
            )}
          </div>

          {/* 주문 품목 목록 */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-[#523120] mb-3">주문 상품 목록</h3>
            <div className="flex flex-col gap-2.5">
              {order.items?.map((item) => (
                  <div
                      key={item.orderItemId}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#f0ece5] bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                          src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80&auto=format&fit=crop&q=60'
                          }
                          alt={item.productName}
                          className="w-10 h-10 rounded-md object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2b2523]">{item.productName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {item.unitPrice.toLocaleString()}원 × {item.quantity}개
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#523120]">
                      {(item.unitPrice * item.quantity).toLocaleString()}원
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* 총 결제 금액 */}
          <div className="border-t border-[#eae7e1] pt-4 flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-[#2b2523]">총 결제 금액</span>
            <span className="text-base font-extrabold text-[#523120]">
            {order.totalAmount.toLocaleString()}원
          </span>
          </div>

          {/* 모달 하단 버튼 바 */}
          <div className="flex justify-between items-center">
            <div>
              {!isDelivered ? (
                  <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    이 주문 삭제하기
                  </button>
              ) : (
                  <span className="text-xs text-neutral-400">배송 완료 주문은 삭제할 수 없습니다.</span>
              )}
            </div>
            <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-[#eae5dd] hover:bg-[#ded7cc] text-[#2b2523] rounded-lg transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
  );
}