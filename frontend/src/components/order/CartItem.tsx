import type { CartItem as CartItemType } from '@/types/product'

interface CartItemProps {
  item: CartItemType
  onIncrease: (productId: number) => void
  onDecrease: (productId: number) => void
  onRemove: (productId: number) => void
}

export default function CartItem({
                                   item,
                                   onIncrease,
                                   onDecrease,
                                   onRemove,
                                 }: CartItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&auto=format&fit=crop&q=80'

  return (
      <div className="py-4 first:pt-0 last:pb-0">
        <div className="flex gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F6F4F0] dark:bg-[#3d2e22]">
            <img
                src={item.imageUrl || fallbackImage}
                alt={item.name}
                className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <strong className="text-sm text-[#2b2420] dark:text-[#f3e9dc]">
                {item.name}
              </strong>

              <strong className="whitespace-nowrap text-sm text-[#4E2D1D] dark:text-[#e8c9a0]">
                {(item.price * item.quantity).toLocaleString('ko-KR')}원
              </strong>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex overflow-hidden rounded-lg border border-[#E9E5DC] dark:border-[#4a3b2f]">
                <button
                    type="button"
                    onClick={() => onDecrease(item.productId)}
                    className="h-8 w-8 bg-[#F6F4F0] text-base hover:bg-[#E9E5DC] dark:bg-[#332720] dark:hover:bg-[#3d2e22]"
                >
                  −
                </button>

                <span className="flex min-w-10 items-center justify-center bg-white text-sm font-semibold dark:bg-[#2b211a]">
                {item.quantity}
              </span>

                <button
                    type="button"
                    onClick={() => onIncrease(item.productId)}
                    className="h-8 w-8 bg-[#F6F4F0] text-base hover:bg-[#E9E5DC] dark:bg-[#332720] dark:hover:bg-[#3d2e22]"
                >
                  +
                </button>
              </div>

              <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="rounded-lg border border-[#FECACA] px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2] dark:border-[#5c332c] dark:text-[#f0897a]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}