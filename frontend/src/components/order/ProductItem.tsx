import type { ProductResponse } from '@/types/product';

interface ProductItemProps {
  product: ProductResponse;
  onAdd: (product: ProductResponse) => void;
}

export default function ProductItem({
                                      product,
                                      onAdd,
                                    }: ProductItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80'

  return (
      <article className="rounded-2xl border border-[#E9E5DC] bg-white p-5 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
        <div className="flex gap-5">
          {/* 상품 이미지 */}
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F6F4F0] dark:bg-[#3d2e22]">
            <img
                src={product.imageUrl || fallbackImage}
                alt={product.name}
                className="h-full w-full object-cover"
            />
          </div>

          {/* 상품 정보 + 담기 버튼 */}
          <div className="flex min-h-24 min-w-0 flex-1 flex-col">
            {/* 상품명 + 가격 */}
            <div>
              <h3 className="text-lg font-bold text-[#2b2420] dark:text-[#f3e9dc]">
                {product.name}
              </h3>

              <p className="mt-2 text-base font-bold text-[#4E2D1D] dark:text-[#e8c9a0]">
                {product.price.toLocaleString('ko-KR')}원
              </p>
            </div>

            {/* 담기 버튼 */}
            <button
                type="button"
                onClick={() => onAdd(product)}
                className="
              mt-auto self-end
              rounded-lg
              bg-[#4E2D1D]
              px-5 py-2
              text-sm font-semibold text-white
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-[#3D2115]
              hover:shadow-md
              active:translate-y-0
              dark:bg-[#e8c9a0]
              dark:text-[#201812]
              dark:hover:bg-[#d9b98e]
            "
            >
              담기
            </button>
          </div>
        </div>
      </article>
  )
}