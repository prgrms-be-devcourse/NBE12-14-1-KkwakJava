import type {DeliveryOrderResponse} from '@/types/delivery';

const BASE_URL = 'http://localhost:8080/orders/merged';

// 백엔드 에러 메시지 가져오기
const extractErrorMessage = async (
    res: Response,
    defaultMsg: string
): Promise<string> => {
  try {
    const data = await res.clone().json();

    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  } catch {
    try {
      const text = await res.text();

      if (text) {
        return text;
      }
    } catch {
    }
  }

  return defaultMsg;
};

// 배송 전체 조회
export const getDeliveryOrders = async (): Promise<DeliveryOrderResponse[]> => {
  const res = await fetch(BASE_URL, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorMsg = await extractErrorMessage(
        res,
        '배송 목록을 불러오는데 실패했습니다.'
    );

    throw new Error(errorMsg);
  }

  return res.json();
};
