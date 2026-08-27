'use client';

import { useEffect, useState } from 'react';

import { createOrder } from '@/api/orderApi';
import { getProducts } from '@/api/productApi';

import ProductList from '@/components/order/ProductList';
import Cart from '@/components/order/Cart';
import OrderForm from '@/components/order/OrderForm';

import type { OrderCreateRequest } from '@/types/order';
import type { CartItem, Product } from '@/types/product';

export default function OrderPage() {
  // DB에서 조회한 상품 목록
  const [products, setProducts] = useState<Product[]>([]);

  // 사용자가 장바구니에 담은 상품
  const [cart, setCart] = useState<CartItem[]>([]);

  // 고객 정보
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');

  // 안내 메시지
  const [message, setMessage] = useState('');

  // 상품 조회 중인지 여부
  const [loading, setLoading] = useState(true);

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
  const addToCart = (product: Product) => {
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

  // 장바구니에서 완전히 삭제
  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
        currentCart.filter(
            (item) => item.productId !== productId
        )
    );
  };

  // 총 주문 금액
  const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
  );

  // 주문하기
  const submitOrder = async () => {
    setMessage('');

    // 1. 상품 검증
    if (cart.length === 0) {
      setMessage('주문할 상품을 선택해주세요.');
      return;
    }

    // 2. 이메일 검증
    if (!email.trim()) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setMessage('올바른 이메일 형식으로 입력해주세요.');
      return;
    }

    // 3. 우편번호 검증
    if (!postalCode.trim()) {
      setMessage('우편번호를 입력해주세요.');
      return;
    }

    // 4. 주소 검증
    if (!address.trim()) {
      setMessage('주소를 입력해주세요.');
      return;
    }

    // 백엔드 OrderCreateRequest 형태로 변환
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
      await createOrder(request);

      setMessage('주문이 완료되었습니다.');

      // 주문 완료 후 입력값 초기화
      setCart([]);
      setEmail('');
      setPostalCode('');
      setAddress('');
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('주문 중 오류가 발생했습니다.');
      }
    }
  };

  return (
      <main className="min-h-screen bg-[#F6F5F2] text-[#2B2523]">

        {/* 페이지 내용 */}
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#4E2D1D]">
              원두 주문
            </h1>

            <p className="mt-2 text-sm text-[#8C857B]">
              원하는 원두를 장바구니에 담고 주문 정보를 입력해 주세요.
            </p>
          </div>

          {loading ? (
              <div className="rounded-xl border border-[#E9E5DC] bg-white p-10 text-center text-sm text-[#8C857B]">
                상품을 불러오는 중입니다.
              </div>
          ) : (
              <div className="flex items-start gap-8">
                {/* 왼쪽 상품 목록 */}
                <ProductList
                    products={products}
                    onAdd={addToCart}
                />

                {/* 오른쪽 주문 영역 */}
                <section className="min-w-0 flex-1 rounded-xl border border-[#E9E5DC] bg-white p-7">
                  <Cart
                      cart={cart}
                      onIncrease={increaseQuantity}
                      onDecrease={decreaseQuantity}
                      onRemove={removeFromCart}
                  />

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
                      <div className="mt-5 rounded-lg bg-[#F6F4F0] px-4 py-3 text-sm font-medium text-[#4E2D1D]">
                        {message}
                      </div>
                  )}
                </section>
              </div>
          )}
        </div>
      </main>
  );
}