'use client';

import { useEffect, useState } from 'react';

import CartItem from './CartItem';

import ConfirmModal from '@/components/order/ConfirmModal';

import type { CartItem as CartItemType } from '@/types/product';

interface CartProps {
  cart: CartItemType[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemoveSelected: (productIds: number[]) => void;
}

export default function Cart({
                               cart,
                               onIncrease,
                               onDecrease,
                               onRemoveSelected,
                             }: CartProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 장바구니에서 사라진 상품은 선택 목록에서도 제거
  useEffect(() => {
    setSelectedProductIds((currentSelected) =>
        currentSelected.filter((productId) =>
            cart.some((item) => item.productId === productId)
        )
    );
  }, [cart]);

  // 개별 상품 선택 / 선택 해제
  const toggleProduct = (productId: number) => {
    setSelectedProductIds((currentSelected) => {
      if (currentSelected.includes(productId)) {
        return currentSelected.filter((id) => id !== productId);
      }

      return [...currentSelected, productId];
    });
  };

  // 모든 상품이 선택되어 있는지
  const allSelected =
      cart.length > 0 && selectedProductIds.length === cart.length;

  // 모두 선택 / 모두 선택 해제
  const toggleAllProducts = () => {
    if (allSelected) {
      setSelectedProductIds([]);
      return;
    }

    setSelectedProductIds(
        cart.map((item) => item.productId)
    );
  };

  // 선택 삭제 버튼 클릭
  const openDeleteModal = () => {
    if (selectedProductIds.length === 0) {
      return;
    }

    setIsDeleteModalOpen(true);
  };

// 실제 삭제 확정
  const confirmDeleteSelectedProducts = () => {
    onRemoveSelected(selectedProductIds);
    setSelectedProductIds([]);
    setIsDeleteModalOpen(false);
  };

  return (
      <div>
        {/* 제목 + 선택 삭제 */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#2b2420] dark:text-[#f3e9dc]">
              주문 요약
            </h2>

            <p className="mt-1 text-sm text-[#8a7d70]">
              선택한 상품과 수량을 확인해 주세요.
            </p>
          </div>

          {cart.length > 0 && (
              <button
                  type="button"
                  onClick={openDeleteModal}
                  disabled={selectedProductIds.length === 0}
                  className={`
      shrink-0 rounded-lg
      px-4 py-2
      text-sm font-semibold
      transition-all duration-200
      ${
                      selectedProductIds.length > 0
                          ? `
            bg-[#DC2626]
            text-white
            hover:-translate-y-0.5
            hover:bg-[#B91C1C]
            hover:shadow-md
            active:translate-y-0
          `
                          : `
            cursor-not-allowed
            bg-[#E5E7EB]
            text-[#9CA3AF]
          `
                  }
    `}
              >
                선택 삭제
              </button>
          )}
        </div>

        {cart.length === 0 ? (
            /* 빈 장바구니 */
            <div className="rounded-xl bg-[#F6F4F0] px-5 py-8 text-center text-sm text-[#8a7d70] dark:bg-[#332720]">
              장바구니가 비어 있습니다.
            </div>
        ) : (
            <>
              {/* 모두 선택 */}
              <div className="mb-2 flex items-center gap-2 border-b border-[#E9E5DC] px-1 pb-3 dark:border-[#4a3b2f]">
                <input
                    type="checkbox"
                    id="select-all-cart"
                    checked={allSelected}
                    onChange={toggleAllProducts}
                    className="h-4 w-4 cursor-pointer accent-[#4E2D1D]"
                />

                <label
                    htmlFor="select-all-cart"
                    className="cursor-pointer text-sm font-medium text-[#8a7d70]"
                >
                  모두 선택
                </label>
              </div>

              {/* 상품 목록 */}
              <div className="divide-y divide-[#E9E5DC] dark:divide-[#4a3b2f]">
                {cart.map((item) => (
                    <CartItem
                        key={item.productId}
                        item={item}
                        checked={selectedProductIds.includes(item.productId)}
                        onToggle={toggleProduct}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                    />
                ))}
              </div>
            </>
        )}

        <ConfirmModal
            isOpen={isDeleteModalOpen}
            title="선택 상품 삭제"
            message={`선택한 ${selectedProductIds.length}개의 상품을 장바구니에서 삭제하시겠습니까?`}
            confirmText="삭제"
            variant="danger"
            onConfirm={confirmDeleteSelectedProducts}
            onCancel={() => setIsDeleteModalOpen(false)}
        />
      </div>
  );
}