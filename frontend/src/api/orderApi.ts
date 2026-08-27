import type { OrderResponse, OrderUpdateRequest } from '@/types/order';

const BASE_URL = 'http://localhost:8080/orders';

// 백엔드 에러 JSON에서 message 필드만 추출하는 헬퍼 함수
const extractErrorMessage = async (res: Response, defaultMsg: string): Promise<string> => {
  try {
    const data = await res.json();
    if (data && data.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }
    if (data && data.error) {
      return data.error;
    }
  } catch {
    // JSON이 아닌 일반 텍스트일 경우 처리
    try {
      const text = await res.text();
      if (text) return text;
    } catch {
      // ignore
    }
  }
  return defaultMsg;
};

// 주문 목록 조회
export const getOrders = async (email?: string): Promise<OrderResponse[]> => {
  const url = new URL(BASE_URL);
  if (email && email.trim()) {
    url.searchParams.append('email', email.trim());
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    const errorMsg = await extractErrorMessage(res, '주문 목록을 불러오는데 실패했습니다.');
    throw new Error(errorMsg);
  }
  return res.json();
};

// 주문 수정
export const updateOrder = async (orderId: number, data: OrderUpdateRequest): Promise<OrderResponse> => {
  const res = await fetch(`${BASE_URL}/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorMsg = await extractErrorMessage(res, '주문 수정에 실패했습니다.');
    throw new Error(errorMsg);
  }
  return res.json();
};

// 단건 주문 삭제
export const deleteOrder = async (orderId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${orderId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorMsg = await extractErrorMessage(res, '주문 삭제에 실패했습니다.');
    throw new Error(errorMsg);
  }
};

// 다건 주문 삭제
export const deleteOrders = async (orderIds: number[]): Promise<void> => {
  const params = new URLSearchParams();
  orderIds.forEach((id) => params.append('orderIds', id.toString()));

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorMsg = await extractErrorMessage(res, '선택한 주문 삭제에 실패했습니다.');
    throw new Error(errorMsg);
  }
};