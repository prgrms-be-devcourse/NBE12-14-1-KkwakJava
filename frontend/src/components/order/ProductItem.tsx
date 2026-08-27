import type { Product } from '@/types/product'

interface ProductItemProps {
  product: Product
  onAdd: (product: Product) => void
}

export default function ProductItem({
                                      product,
                                      onAdd,
                                    }: ProductItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80'

  return (
      <article className="rounded-2xl border border-[#E9E5DC] bg-white px-5 py-4 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
        <div className="flex items-center gap-5">
          {/* 상품 이미지 */}
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F6F4F0] dark:bg-[#3d2e22]">
            <img
                src={product.imageUrl || fallbackImage}
                alt={product.name}
                className="h-full w-full object-cover"
            />
          </div>

          {/* 상품명 + 가격 */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-[#2b2420] dark:text-[#f3e9dc]">
              {product.name}
            </h3>

            <p className="mt-2 text-base font-bold text-[#4E2D1D] dark:text-[#e8c9a0]">
              {product.price.toLocaleString('ko-KR')}원
            </p>
          </div>

          {/* 장바구니 버튼 */}
          <button
              type="button"
              onClick={() => onAdd(product)}
              className="mr-4 shrink-0 rounded-lg bg-[#4E2D1D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#523120] dark:bg-[#e8c9a0] dark:text-[#201812]"
          >
            장바구니에 담기
          </button>
        </div>
      </article>
  )
}