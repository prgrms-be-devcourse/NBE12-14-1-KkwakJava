import type { Product } from '@/types/product';
import ProductItem from './ProductItem';

interface ProductListProps {
  products: Product[];
  onAdd: (product: Product) => void;
}

export default function ProductList({
                                      products,
                                      onAdd,
                                    }: ProductListProps) {
  return (
      <section className="min-w-0 flex-[1.4]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#4E2D1D]">
            원두 목록
          </h2>

          <p className="mt-2 text-sm text-[#8C857B]">
            원하는 원두를 선택해 주세요.
          </p>
        </div>

        {products.length === 0 ? (
            <div className="rounded-xl border border-[#E9E5DC] bg-white p-8 text-center text-sm text-[#8C857B]">
              등록된 상품이 없습니다.
            </div>
        ) : (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                  <ProductItem
                      key={product.id}
                      product={product}
                      onAdd={onAdd}
                  />
              ))}
            </div>
        )}
      </section>
  );
}