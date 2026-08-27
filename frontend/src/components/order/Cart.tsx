import type { CartItem as CartItemType } from '@/types/product'
import CartItem from './CartItem'

interface CartProps {
  cart: CartItemType[]
  onIncrease: (productId: number) => void
  onDecrease: (productId: number) => void
  onRemove: (productId: number) => void
}

export default function Cart({
                               cart,
                               onIncrease,
                               onDecrease,
                               onRemove,
                             }: CartProps) {
  return (
      <div className="mb-8">
        <div className="mb-5">
          <h2 className="text-base font-bold text-[#2b2420] dark:text-[#f3e9dc]">
            주문 요약
          </h2>

          <p className="mt-1 text-sm text-[#8a7d70]">
            선택한 상품과 수량을 확인해 주세요.
          </p>
        </div>

        {cart.length === 0 ? (
            <div className="rounded-xl bg-[#F6F4F0] px-5 py-8 text-center text-sm text-[#8a7d70] dark:bg-[#332720]">
              장바구니가 비어 있습니다.
            </div>
        ) : (
            <div className="divide-y divide-[#E9E5DC] dark:divide-[#4a3b2f]">
              {cart.map((item) => (
                  <CartItem
                      key={item.productId}
                      item={item}
                      onIncrease={onIncrease}
                      onDecrease={onDecrease}
                      onRemove={onRemove}
                  />
              ))}
            </div>
        )}
      </div>
  )
}