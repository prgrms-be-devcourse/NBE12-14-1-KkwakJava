'use client';

import { useState, useEffect } from 'react';
import { createProduct } from '@/api/productApi';
import type { ProductResponse } from '@/types/product';

type Props = {
    onCreated: (product: ProductResponse) => void;
};

// 💡 이미지 유효성 검사 함수 (3초 타임아웃 적용)
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

export default function ProductCreateForm({ onCreated }: Props) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPreviewError, setIsPreviewError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsPreviewError(false);
    }, [imageUrl]);

    // 💡 입력 폼 초기화 함수
    const resetForm = () => {
        setName('');
        setPrice('');
        setImageUrl('');
    };

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

        const numPrice = Number(price);
        if (numPrice > 2000000000) {
            alert('가격은 20억 이하로 입력해 주세요.');
            return;
        }

        const trimmedImageUrl = imageUrl.trim();

        // 💡 1. URL이 입력된 경우에만 유효성 검증 (빈값이면 통과)
        if (trimmedImageUrl !== '') {
            setIsSubmitting(true);
            const isValid = await checkValidImage(trimmedImageUrl);
            setIsSubmitting(false);

            if (!isValid) {
                alert(
                    '입력하신 이미지 URL을 불러올 수 없습니다.\n' +
                    '올바른 이미지 주소를 입력하거나, 빈칸으로 두시면 기본 이미지가 사용됩니다.'
                );
                resetForm(); // 잘못된 URL 입력 시에도 폼 비우기
                return;
            }
        }

        // 💡 2. 등록 API 요청
        try {
            setIsSubmitting(true);
            const product = await createProduct({
                name: name.trim(),
                price: numPrice,
                imageUrl: trimmedImageUrl,
            });

            onCreated(product);
            resetForm(); // 성공 시 초기화
            alert('상품이 등록되었습니다.');
        } catch (err) {
            console.error(err);
            resetForm(); // 실패 시 초기화
            alert(
                err instanceof Error
                    ? err.message
                    : '상품 등록 중 오류가 발생했습니다.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex w-[420px] flex-col justify-between rounded-3xl border border-[#e9e5dc] bg-white px-9 py-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div>
                <h2 className="mb-2 text-xl font-bold text-[#2b2523]">상품 등록</h2>
                <p className="mb-7 mt-0 text-sm text-[#8c857b]">새 원두 상품 정보를 입력해 주세요.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-[#444]">상품명</label>
                    <input
                        type="text"
                        placeholder="상품명을 입력하세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-[13px] text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                    />

                    <label className="mt-2.5 text-sm font-semibold text-[#444]">가격</label>
                    <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-4 text-[15px] text-[#888]">₩</span>
                        <input
                            type="number"
                            placeholder="0"
                            max="2000000000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full rounded-xl border border-[#d9d4cb] bg-white py-[13px] pl-9 pr-9 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                        />
                        <span className="pointer-events-none absolute right-4 text-sm text-[#888]">원</span>
                    </div>

                    <label className="mt-2.5 text-sm font-semibold text-[#444]">이미지 URL</label>
                    <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-[13px] text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                    />

                    <div className="mt-2.5 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#e9e5dc] bg-[#faf9f7]">
                        {imageUrl && !isPreviewError ? (
                            <img
                                src={imageUrl}
                                alt="미리보기"
                                className="h-full w-full object-cover"
                                onError={() => setIsPreviewError(true)}
                            />
                        ) : isPreviewError ? (
                            <div className="px-5 text-center text-red-500">
                                <span className="mb-1 block text-2xl">⚠️</span>
                                <span className="block text-[13px] font-semibold">이미지를 불러올 수 없습니다</span>
                                <span className="mt-1 block text-xs text-[#a0998f]">URL을 다시 확인해 주세요</span>
                            </div>
                        ) : (
                            <div className="px-5 text-center">
                                <span className="block text-[13px] font-semibold text-[#6d665e]">
                                    이미지 미리보기
                                </span>
                                <span className="mt-1 block text-xs text-[#a0998f]">
                                    이미지 주소(URL)를 입력하시면 미리보기가 표시됩니다
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 w-full cursor-pointer rounded-xl bg-[#4e2d1d] py-4 text-[15px] font-semibold text-white shadow-[0_2px_6px_rgba(78,45,29,0.25)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2e1810] disabled:opacity-50"
                    >
                        {isSubmitting ? '확인 중...' : '등록하기'}
                    </button>
                </form>
            </div>
        </div>
    );
}