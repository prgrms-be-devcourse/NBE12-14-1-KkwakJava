'use client';

import { useState, useEffect, useRef } from 'react';
import type { ProductResponse } from '@/types/product';

type Props = {
    products: ProductResponse[];
    onEdit: (product: ProductResponse) => void;
    onDelete: (product: ProductResponse) => void;
};

export default function ProductList({
                                        products,
                                        onEdit,
                                        onDelete,
                                    }: Props) {
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // 바깥 영역 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setActiveDropdownId(null);
            }
        };

        if (activeDropdownId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdownId]);

    if (products.length === 0) {
        return (
            <div className="py-[120px] text-center text-base text-[#a0998f]">
                등록된 상품이 없습니다.
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl border border-[#e9e5dc] bg-white">
            {/* 테이블 헤더 */}
            <div className="flex items-center divide-x divide-[#e9e5dc] border-b border-[#e9e5dc] bg-[#fcfbf9] text-sm font-bold text-[#6d665e] rounded-t-xl">
                <div className="w-24 py-3 text-center">이미지</div>
                <div className="flex-1 px-4 py-3 text-center">상품명</div>
                <div className="w-36 px-4 py-3 text-center">가격</div>
                <div className="w-20 py-3 text-center">관리</div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-[#e9e5dc]">
                {products.map((product, index) => {
                    const isLastItem = index === products.length - 1;

                    return (
                        <div
                            key={product.id}
                            className="flex items-center divide-x divide-[#f0ece6] transition hover:bg-[#faf8f5]"
                        >
                            {/* 1. 이미지 */}
                            <div className="flex w-24 items-center justify-center py-3">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-14 w-14 rounded-lg border border-[#eee] object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://placehold.co/56x56?text=Coffee';
                                    }}
                                />
                            </div>

                            {/* 2. 상품명 */}
                            <div className="flex-1 px-4 py-3 text-base font-bold text-[#2b2523]">
                                {product.name}
                            </div>

                            {/* 3. 가격 */}
                            <div className="w-36 px-4 py-3 text-right text-base font-bold text-[#2b2523]">
                                {product.price.toLocaleString()}원
                            </div>

                            {/* 4. 관리 (드롭다운) */}
                            <div
                                className="relative flex w-20 items-center justify-center py-3"
                                ref={activeDropdownId === product.id ? dropdownRef : null}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveDropdownId(
                                            activeDropdownId === product.id ? null : product.id
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e9e5dc] bg-white text-base font-bold text-[#666] transition hover:border-[#4e2d1d] hover:bg-[#f6f4f0]"
                                >
                                    ⋮
                                </button>

                                {activeDropdownId === product.id && (
                                    <div
                                        className={`absolute right-2 z-30 w-[110px] overflow-hidden rounded-xl border border-[#e9e5dc] bg-white py-1 shadow-lg ${
                                            isLastItem ? 'bottom-11' : 'top-11'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveDropdownId(null);
                                                onEdit(product);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm font-semibold text-[#4a443f] hover:bg-[#f6f4f0]"
                                        >
                                            ✏️ 수정
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveDropdownId(null);
                                                onDelete(product);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm font-semibold text-[#dc2626] hover:bg-[#fef2f2]"
                                        >
                                            🗑️ 삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}