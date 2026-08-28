'use client';

import { useState } from 'react';
import type { ProductResponse, ProductUpdateRequest } from '@/types/product';

type Props = {
    product: ProductResponse;
    onClose: () => void;
    onSave: (id: number, data: ProductUpdateRequest) => Promise<void>;
};

// 💡 이미지 유효성 검사 함수
const checkValidImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => resolve(false), 3000);

        img.src = url;
        img.onload = () => {
            clearTimeout(timer);
            resolve(true);
        };
        img.onerror = () => {
            clearTimeout(timer);
            resolve(false);
        };
    });
};

export default function ProductEditModal({
                                             product,
                                             onClose,
                                             onSave,
                                         }: Props) {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(String(product.price));
    const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('상품명을 입력해주세요.');
            return;
        }

        if (!price) {
            alert('가격을 입력해주세요.');
            return;
        }

        const trimmedImageUrl = imageUrl.trim();

        // 💡 1. 이미지 검증 (입력된 경우만 실행)
        if (trimmedImageUrl !== '') {
            setIsSubmitting(true);
            const isValid = await checkValidImage(trimmedImageUrl);
            setIsSubmitting(false);

            if (!isValid) {
                alert(
                    '입력하신 이미지 URL을 불러올 수 없습니다.\n' +
                    '올바른 이미지 주소를 입력하거나, 빈칸으로 두시면 기본 이미지가 사용됩니다.'
                );
                onClose(); // URL 검증 실패 시에도 모달 닫기
                return;
            }
        }

        // 💡 2. 수정 API 요청
        try {
            setIsSubmitting(true);
            await onSave(product.id, {
                name: name.trim(),
                price: Number(price),
                imageUrl: trimmedImageUrl,
            });

            onClose(); // 성공 시 모달 닫기
            alert('상품 정보가 수정되었습니다.');
        } catch (err) {
            console.error(err);
            onClose(); // 실패 시 모달 닫기
            alert(
                err instanceof Error
                    ? err.message
                    : '상품 수정 중 오류가 발생했습니다.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="w-[440px] rounded-3xl border border-[#e9e5dc] bg-white p-8 shadow-2xl">
                <h3 className="mb-1 text-xl font-bold text-[#2b2523]">
                    상품 정보 수정
                </h3>

                <p className="mb-6 text-sm text-[#8c857b]">
                    수정할 원두 상품의 정보를 입력해 주세요.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-[#444]">
                        상품명
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-3 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                    />

                    <label className="mt-2 text-sm font-semibold text-[#444]">
                        가격
                    </label>
                    <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-4 text-[15px] text-[#888]">
                            ₩
                        </span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full rounded-xl border border-[#d9d4cb] bg-white py-3 pl-9 pr-9 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                        />
                        <span className="pointer-events-none absolute right-4 text-sm text-[#888]">
                            원
                        </span>
                    </div>

                    <label className="mt-2 text-sm font-semibold text-[#444]">
                        이미지 URL
                    </label>
                    <input
                        type="text"
                        value={imageUrl}
                        placeholder="https://example.com/image.jpg"
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-3 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                    />

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl border border-[#e9e5dc] bg-white px-5 py-3 text-sm font-semibold text-[#666] hover:bg-[#f6f4f0]"
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer rounded-xl bg-[#4e2d1d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3b2216] disabled:opacity-50"
                        >
                            {isSubmitting ? '확인 중...' : '저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}