import type { Product } from '@/types/product';

interface ProductItemProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductItem({
                                      product,
                                      onAdd,
                                    }: ProductItemProps) {
  const fallbackImage =
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80';

  return (
      <article className="flex items-center gap-5 rounded-xl border border-[#E9E5DC] bg-white p-5">
        <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            className="h-28 w-28 shrink-0 rounded-lg border border-[#E9E5DC] object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-[#2B2523]">
            {product.name}
          </h3>

          <p className="mt-2 text-base font-bold text-[#4E2D1D]">
            {product.price.toLocaleString()}원
          </p>
        </div>

        <button
            type="button"
            onClick={() => onAdd(product)}
            className="rounded-lg bg-[#4E2D1D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#523120]"
        >
          담기
        </button>
      </article>
  );
}