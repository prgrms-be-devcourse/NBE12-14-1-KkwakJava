import type { CartItem as CartItemType } from '@/types/product';

interface CartItemProps {
  item: CartItemType;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({
                                   item,
                                   onIncrease,
                                   onDecrease,
                                   onRemove,
                                 }: CartItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&auto=format&fit=crop&q=80';

  return (
      <div className="border-b border-[#E9E5DC] py-4 last:border-b-0">
        <div className="flex gap-3">
          <img
              src={item.imageUrl || fallbackImage}
              alt={item.name}
              className="h-14 w-14 shrink-0 rounded-lg border border-[#E9E5DC] object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <strong className="text-sm text-[#2B2523]">
                {item.name}
              </strong>

              <strong className="whitespace-nowrap text-sm text-[#4E2D1D]">
                {(item.price * item.quantity).toLocaleString()}원
              </strong>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex overflow-hidden rounded-lg border border-[#E9E5DC]">
                <button
                    type="button"
                    onClick={() => onDecrease(item.productId)}
                    className="h-8 w-8 bg-[#F6F4F0] text-lg"
                >
                  −
                </button>

                <span className="flex min-w-10 items-center justify-center text-sm font-semibold">
                {item.quantity}
              </span>

                <button
                    type="button"
                    onClick={() => onIncrease(item.productId)}
                    className="h-8 w-8 bg-[#F6F4F0] text-lg"
                >
                  +
                </button>
              </div>

              <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="text-xs font-semibold text-[#DC2626]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}