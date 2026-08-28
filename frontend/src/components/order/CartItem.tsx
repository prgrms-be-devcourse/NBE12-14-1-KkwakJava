import type { CartItem as CartItemType } from '@/types/product';

interface CartItemProps {
  item: CartItemType;
  checked: boolean;
  onToggle: (productId: number) => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
}

export default function CartItem({
                                   item,
                                   checked,
                                   onToggle,
                                   onIncrease,
                                   onDecrease,
                                 }: CartItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80';

  return (
      <div className="flex gap-3 py-4">
        {/* 체크박스 */}
        <div className="flex items-start pt-1">
          <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(item.productId)}
              aria-label={`${item.name} 선택`}
              className="
            h-4 w-4 cursor-pointer
            accent-[#4E2D1D]
          "
          />
        </div>

        {/* 이미지 */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F6F4F0] dark:bg-[#3d2e22]">
          <img
              src={item.imageUrl || fallbackImage}
              alt={item.name}
              className="h-full w-full object-cover"
          />
        </div>

        {/* 상품 정보 */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#2b2420] dark:text-[#f3e9dc]">
            {item.name}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#4E2D1D] dark:text-[#e8c9a0]">
            {(item.price * item.quantity).toLocaleString('ko-KR')}원
          </p>

          {/* 수량 */}
          <div className="mt-3 flex items-center gap-2">
            <button
                type="button"
                onClick={() => onDecrease(item.productId)}
                className="
              flex h-7 w-7 items-center justify-center
              rounded-md border border-[#E9E5DC]
              text-[#4E2D1D]
              transition
              hover:bg-[#F6F4F0]
              dark:border-[#4a3b2f]
              dark:text-[#e8c9a0]
              dark:hover:bg-[#3d2e22]
            "
            >
              −
            </button>

            <span className="min-w-5 text-center text-sm font-medium">
            {item.quantity}
          </span>

            <button
                type="button"
                onClick={() => onIncrease(item.productId)}
                className="
              flex h-7 w-7 items-center justify-center
              rounded-md border border-[#E9E5DC]
              text-[#4E2D1D]
              transition
              hover:bg-[#F6F4F0]
              dark:border-[#4a3b2f]
              dark:text-[#e8c9a0]
              dark:hover:bg-[#3d2e22]
            "
            >
              +
            </button>
          </div>
        </div>
      </div>
  );
}