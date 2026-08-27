import type { Product } from '@/types/product';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('상품 목록을 불러오는데 실패했습니다.');
  }

  return res.json();
};