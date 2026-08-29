'use client';

import type { ProductResponse } from '@/types/product';

type Props = {
    product: ProductResponse;
    onClose: () => void;
    onConfirm: (id: number) => Promise<void>;
};

export default function ProductDeleteModal({
                                               product,
                                               onClose,
                                               onConfirm,
                                           }: Props) {
    const handleDelete = async () => {
        try {
            await onConfirm(product.id);
            onClose();
        } catch (err) {
            console.error(err);
            alert(
                err instanceof Error
                    ? err.message
                    : '상품 삭제 중 오류가 발생했습니다.'
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="w-[380px] rounded-3xl border border-[#e9e5dc] bg-white p-7 shadow-2xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                    🗑️
                </div>

                <h3 className="mb-1 text-lg font-bold text-[#2b2523]">
                    상품 삭제
                </h3>

                <p className="text-sm leading-relaxed text-[#6d665e]">
                    <strong className="text-[#2b2523]">
                        {product.name}
                    </strong>{' '}
                    상품을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl border border-[#e9e5dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#666] hover:bg-[#f6f4f0]"
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="cursor-pointer rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b91c1c]"
                    >
                        삭제하기
                    </button>
                </div>
            </div>
        </div>
    );
}