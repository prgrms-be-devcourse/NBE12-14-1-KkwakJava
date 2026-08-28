'use client';

import { useEffect, useState } from 'react';

import { createOrder } from '@/api/orderApi';
import { getProducts } from '@/api/productApi';

import { useRouter } from 'next/navigation';

import ConfirmModal from '@/components/common/ConfirmModal';
import OrderSuccessModal from '@/components/order/OrderSuccessModal';

import ProductList from '@/components/order/ProductList';
import Cart from '@/components/order/Cart';
import OrderForm from '@/components/order/OrderForm';

import type { OrderCreateRequest } from '@/types/order';
import type {
  CartItem,
  ProductResponse,
} from '@/types/product';

export default function OrderPage() {
  // DB에서 조회한 상품 목록
  const [products, setProducts] = useState<ProductResponse[]>([]);

  // 사용자가 장바구니에 담은 상품
  const [cart, setCart] = useState<CartItem[]>([]);

  // 고객 정보
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');

  // 안내 메시지
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 상품 조회 중인지 여부
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 주문할 것인지 재확인
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주문 완료한 고객 이메일 저장
  const [completedOrderEmail, setCompletedOrderEmail] = useState('');

  // 페이지 최초 진입 시 상품 조회
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        console.error(error);
        setMessage('상품 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 상품을 장바구니에 추가
  const addToCart = (product: ProductResponse) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
          (item) => item.productId === product.id
      );

      // 이미 담긴 상품이면 수량만 증가
      if (existingItem) {
        return currentCart.map((item) =>
            item.productId === product.id
                ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
                : item
        );
      }

      // 처음 담는 상품
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
      };

      // 상품 목록에 표시된 순서대로 장바구니 정렬
      return [...currentCart, newItem].sort((a, b) => {
        const aIndex = products.findIndex(
            (product) => product.id === a.productId
        );

        const bIndex = products.findIndex(
            (product) => product.id === b.productId
        );

        return aIndex - bIndex;
      });
    });
  };

  // 수량 증가
  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
        currentCart.map((item) =>
            item.productId === productId
                ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
                : item
        )
    );
  };

  // 수량 감소
  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
        currentCart
        .map((item) =>
            item.productId === productId
                ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
                : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeSelectedFromCart = (productIds: number[]) => {
    setCart((currentCart) =>
        currentCart.filter(
            (item) => !productIds.includes(item.productId)
        )
    );
  };

  const clearCart = () => {
    const confirmed = window.confirm(
        '장바구니에 담긴 상품을 모두 삭제하시겠습니까?'
    );

    if (!confirmed) {
      return;
    }

    setCart([]);
  };

  // 총 주문 금액
  const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
  );

  // 주문 가능한 상태인지 검사
  const submitOrder = () => {
    setMessage('');
    setIsError(false);

    if (cart.length === 0) {
      setIsError(true);
      setMessage('주문할 상품을 선택해주세요.');
      return;
    }

    if (!email.trim()) {
      setIsError(true);
      setMessage('이메일을 입력해주세요.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setIsError(true);
      setMessage(
          '올바른 이메일 형식으로 입력해주세요.\n예: example@test.com'
      );
      return;
    }

    if (!postalCode.trim()) {
      setIsError(true);
      setMessage('우편번호를 입력해주세요.');
      return;
    }

    const postalCodePattern = /^\d{5}$/;

    if (!postalCodePattern.test(postalCode.trim())) {
      setIsError(true);
      setMessage('우편번호는 5자리 숫자로 입력해주세요.');
      return;
    }

    if (!address.trim()) {
      setIsError(true);
      setMessage('주소를 입력해주세요.');
      return;
    }

    // 모든 validation 통과 후 주문 확인창 표시
    setIsOrderConfirmOpen(true);
  };

  // 진짜 주문할 것인지 확인
  const confirmOrder = async () => {
    const request: OrderCreateRequest = {
      email: email.trim(),
      postalCode: postalCode.trim(),
      address: address.trim(),
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      setIsSubmitting(true);
      setMessage('');
      setIsError(false);

      await createOrder(request);

      setIsOrderConfirmOpen(false);

// 방금 주문한 고객 이메일 저장
      setCompletedOrderEmail(email.trim());

// 입력값 초기화
      setCart([]);
      setEmail('');
      setPostalCode('');
      setAddress('');

      setIsOrderSuccessOpen(true);
    } catch (error) {
      console.error(error);

      setIsOrderConfirmOpen(false);
      setIsError(true);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('주문 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 배송 조회 페이지로 이동
  const goToDelivery = () => {
    setIsOrderSuccessOpen(false);

    router.push(
        `/delivery?email=${encodeURIComponent(completedOrderEmail)}`
    );
  };

  return (
      <main className="min-h-screen bg-[#F6F5F2] text-[#2b2420] dark:bg-[#201812] dark:text-[#f3e9dc]">
        <div className="px-6 pt-5 pb-8 sm:px-12">
          <div className="mx-auto w-full max-w-7xl">
            {/* 페이지 제목 */}
            <div className="mb-5 flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F6F4F0] text-[#4E2D1D] dark:bg-[#3d2e22] dark:text-[#e8c9a0]">
            <span aria-hidden="true" className="text-2xl">
              ☕
            </span>
          </span>

              <div>
                <h1 className="text-2xl font-bold">
                  원두 주문
                </h1>

                <p className="text-sm text-[#8a7d70]">
                  원하는 원두를 선택하고 배송 정보를 입력해 주세요.
                </p>
              </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-[#E9E5DC] bg-white p-10 text-center text-sm text-[#8a7d70] shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
                  상품을 불러오는 중입니다.
                </div>
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.35fr_1fr_1fr]">
                  {/* 1. 상품 목록 */}
                  <ProductList
                      products={products}
                      onAdd={addToCart}
                  />

                  {/* 2. 장바구니 */}
                  <section className="h-full min-w-0 rounded-2xl border border-[#E9E5DC] bg-white p-6 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
                    <Cart
                        cart={cart}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        onRemoveSelected={removeSelectedFromCart}
                    />
                  </section>

                  {/* 3. 고객 정보 */}
                  <section className="h-full min-w-0 rounded-2xl border border-[#E9E5DC] bg-white p-6 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
                    <OrderForm
                        email={email}
                        postalCode={postalCode}
                        address={address}
                        totalAmount={totalAmount}
                        onEmailChange={setEmail}
                        onPostalCodeChange={setPostalCode}
                        onAddressChange={setAddress}
                        onSubmit={submitOrder}
                    />

                    {message && (
                        <div
                            className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                                isError
                                    ? 'bg-red-50 text-[#DC2626]'
                                    : 'bg-[#F6F4F0] text-[#4E2D1D]'
                            }`}
                        >
                          {isError && (
                              <span aria-hidden="true">
        ⚠️
      </span>
                          )}

                          <span className="whitespace-pre-line">
                              {message}
                        </span>
                        </div>
                    )}
                  </section>
                </div>
            )}
          </div>
        </div>

        <ConfirmModal
            isOpen={isOrderConfirmOpen}
            title="주문 확인"
            message={`총 ${totalAmount.toLocaleString('ko-KR')}원을 주문하시겠습니까?`}
            confirmText="주문"
            variant="primary"
            isProcessing={isSubmitting}
            processingText="주문 중..."
            onConfirm={confirmOrder}
            onCancel={() => setIsOrderConfirmOpen(false)}
        />

        <OrderSuccessModal
            isOpen={isOrderSuccessOpen}
            onClose={() => setIsOrderSuccessOpen(false)}
            onViewOrders={goToDelivery}
        />
      </main>
  );
}