import type {
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '@/types/product';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const BASE_URL = `${API_BASE_URL}/products`;

export const getProducts = async (): Promise<ProductResponse[]> => {
  const res = await fetch(BASE_URL, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('상품 목록을 불러오는데 실패했습니다.');
  }

  return res.json();
};

export const createProduct = async (
    data: ProductCreateRequest
): Promise<ProductResponse> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('상품 등록에 실패했습니다.');
  }

  return res.json();
};

export const updateProduct = async (
    id: number,
    data: ProductUpdateRequest
): Promise<ProductResponse> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('상품 수정에 실패했습니다.');
  }

  return res.json();
};

export const deleteProduct = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('상품 삭제에 실패했습니다.');
  }
};