'use client';

import { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 타입 정의
// ==========================================
export interface ProductResponse {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
}

// ==========================================
// 2. 임시 (Mock) 데이터 정의
// ==========================================
const INITIAL_PRODUCTS: ProductResponse[] = [
    {
        id: 1,
        name: '에티오피아 예가체프 G1',
        price: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400',
    },
    {
        id: 2,
        name: '콜롬비아 수프레모',
        price: 16000,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400',
    },
    {
        id: 3,
        name: '과테말라 안티구아 SHB',
        price: 17000,
        imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=400',
    },
    {
        id: 4,
        name: '케냐 AA 림부',
        price: 19500,
        imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400',
    },
    {
        id: 5,
        name: '브라질 세라도 세라도',
        price: 14000,
        imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400',
    },
    {
        id: 6,
        name: '코스타리카 타라주',
        price: 17500,
        imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=400',
    },
    {
        id: 7,
        name: '인도네시아 만델링 G1',
        price: 18500,
        imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=400',
    },
    {
        id: 8,
        name: '디카페인 콜롬비아',
        price: 17000,
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400',
    },
    {
        id: 9,
        name: '시그니처 하우스 블렌드',
        price: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400',
    },
];

// ==========================================
// 3. 메인 통합 컴포넌트 (API 비연동 mock 버전)
// ==========================================
const ITEMS_PER_PAGE = 8; // 한 페이지당 8개 표기

export default function AdminProductPage() {
    // --- [상태 관리: 공통 & 목록] ---
    // API 연동 대신 임시 데이터(INITIAL_PRODUCTS)로 초기화
    const [products, setProducts] = useState<ProductResponse[]>(INITIAL_PRODUCTS);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // --- [상태 관리: 등록 폼] ---
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // --- [상태 관리: 수정 모달] ---
    const [editTarget, setEditTarget] = useState<ProductResponse | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    // --- [상태 관리: 삭제 모달] ---
    const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);

    // --- [외부 클릭 시 드롭다운 닫기] ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    // --- [페이지네이션 계산] ---
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // --- [핸들러: 임시 상품 등록] ---
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            alert('상품명을 입력해주세요.');
            return;
        }
        if (!newPrice) {
            alert('가격을 입력해주세요.');
            return;
        }
        const numPrice = Number(newPrice);
        if (numPrice > 2000000000) {
            alert('가격은 20억 이하로 입력해 주세요.');
            return;
        }

        // 임시 ID 생성 (현재 최대 ID + 1)
        const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

        const newProduct: ProductResponse = {
            id: nextId,
            name: newName.trim(),
            price: numPrice,
            imageUrl: newImageUrl.trim(),
        };

        setProducts((prev) => [newProduct, ...prev]);
        setCurrentPage(1);
        setNewName('');
        setNewPrice('');
        setNewImageUrl('');
        alert('상품이 등록되었습니다. (임시)');
    };

    // --- [핸들러: 수정 모달 열기] ---
    const openEditModal = (product: ProductResponse) => {
        setEditTarget(product);
        setEditName(product.name);
        setEditPrice(String(product.price));
        setEditImageUrl(product.imageUrl || '');
        setActiveDropdownId(null);
    };

    // --- [핸들러: 임시 상품 수정 저장] ---
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        if (!editName.trim()) {
            alert('상품명을 입력해주세요.');
            return;
        }
        if (!editPrice) {
            alert('가격을 입력해주세요.');
            return;
        }

        const updatedProduct: ProductResponse = {
            id: editTarget.id,
            name: editName.trim(),
            price: Number(editPrice),
            imageUrl: editImageUrl.trim(),
        };

        setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
        setEditTarget(null);
        alert('상품 정보가 수정되었습니다. (임시)');
    };

    // --- [핸들러: 임시 상품 삭제 확인] ---
    const handleConfirmDelete = () => {
        if (!deleteTarget) return;

        const updatedProducts = products.filter((p) => p.id !== deleteTarget.id);
        setProducts(updatedProducts);

        const newTotalPages = Math.ceil(updatedProducts.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
        setDeleteTarget(null);
    };

    return (
        <div className="w-full px-12 py-[50px]">
            <div className="mx-auto max-w-[1400px]">
                <div className="flex items-start gap-9">

                    {/* ============================== */}
                    {/* 왼쪽 영역: 상품 등록 폼          */}
                    {/* ============================== */}
                    <div className="flex w-[420px] flex-col justify-between rounded-3xl border border-[#e9e5dc] bg-white px-9 py-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                        <div>
                            <h2 className="mb-2 text-xl font-bold text-[#2b2523]">상품 등록</h2>
                            <p className="mb-7 mt-0 text-sm text-[#8c857b]">새 원두 상품 정보를 입력해 주세요.</p>

                            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
                                <label className="text-sm font-semibold text-[#444]">상품명</label>
                                <input
                                    type="text"
                                    placeholder="상품명을 입력하세요"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-[13px] text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                                />

                                <label className="mt-2.5 text-sm font-semibold text-[#444]">가격</label>
                                <div className="relative flex items-center">
                                    <span className="pointer-events-none absolute left-4 text-[15px] text-[#888]">₩</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        max="2000000000"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full rounded-xl border border-[#d9d4cb] bg-white py-[13px] pl-9 pr-9 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                                    />
                                    <span className="pointer-events-none absolute right-4 text-sm text-[#888]">원</span>
                                </div>

                                <label className="mt-2.5 text-sm font-semibold text-[#444]">이미지 URL (Unsplash)</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-[13px] text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                                />

                                <div className="mt-2.5 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#e9e5dc] bg-[#faf9f7]">
                                    {newImageUrl ? (
                                        <img src={newImageUrl} alt="미리보기" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="px-5 text-center">
                                            <span className="mb-2 block text-3xl">☕</span>
                                            <span className="block text-[13px] font-semibold text-[#6d665e]">
                                                Unsplash 이미지 미리보기
                                            </span>
                                            <span className="mt-1 block text-xs text-[#a0998f]">
                                                Unsplash의 이미지 주소를 붙여넣어 주세요
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="mt-4 w-full cursor-pointer rounded-xl bg-[#4e2d1d] py-4 text-[15px] font-semibold text-white shadow-[0_2px_6px_rgba(78,45,29,0.25)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2e1810]"
                                >
                                    등록하기
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ============================== */}
                    {/* 오른쪽 영역: 상품 목록 카드        */}
                    {/* ============================== */}
                    <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#e9e5dc] bg-white px-9 py-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                        <div>
                            <div className="mb-6 flex items-center gap-3">
                                <span className="text-xl font-bold text-[#2b2523]">등록된 원두 상품</span>
                                <span className="rounded-md border border-[#e9e5dc] bg-[#f6f4f0] px-3 py-1 text-sm font-semibold text-[#6d665e]">
                                    총 {products.length}건
                                </span>
                            </div>

                            {/* 테이블 리스트 영역 */}
                            {products.length === 0 ? (
                                <div className="py-[120px] text-center text-base text-[#a0998f]">
                                    등록된 상품이 없습니다.
                                </div>
                            ) : (
                                <div className="w-full rounded-xl border border-[#e9e5dc] bg-white">
                                    <div className="flex items-center divide-x divide-[#e9e5dc] border-b border-[#e9e5dc] bg-[#fcfbf9] text-sm font-bold text-[#6d665e] rounded-t-xl">
                                        <div className="w-24 py-3 text-center">이미지</div>
                                        <div className="flex-1 px-4 py-3 text-center">상품명</div>
                                        <div className="w-36 px-4 py-3 text-center">가격</div>
                                        <div className="w-20 py-3 text-center">관리</div>
                                    </div>

                                    <div className="divide-y divide-[#e9e5dc]">
                                        {currentProducts.map((product, index) => {
                                            const isLastItem = index === currentProducts.length - 1;

                                            return (
                                                <div key={product.id} className="flex items-center divide-x divide-[#f0ece6] transition hover:bg-[#faf8f5]">
                                                    <div className="flex w-24 items-center justify-center py-3">
                                                        <img
                                                            src={product.imageUrl || 'https://via.placeholder.com/56?text=Coffee'}
                                                            alt={product.name}
                                                            className="h-14 w-14 rounded-lg border border-[#eee] object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 px-4 py-3 text-base font-bold text-[#2b2523]">
                                                        {product.name}
                                                    </div>
                                                    <div className="w-36 px-4 py-3 text-right text-base font-bold text-[#2b2523]">
                                                        {product.price.toLocaleString()}원
                                                    </div>
                                                    <div
                                                        className="relative flex w-20 items-center justify-center py-3"
                                                        ref={activeDropdownId === product.id ? dropdownRef : null}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveDropdownId(activeDropdownId === product.id ? null : product.id)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e9e5dc] bg-white text-base font-bold text-[#666] transition hover:border-[#4e2d1d] hover:bg-[#f6f4f0]"
                                                        >
                                                            ⋮
                                                        </button>

                                                        {activeDropdownId === product.id && (
                                                            <div className={`absolute right-2 z-30 w-[110px] overflow-hidden rounded-xl border border-[#e9e5dc] bg-white py-1 shadow-lg ${isLastItem ? 'bottom-11' : 'top-11'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(product)}
                                                                    className="w-full px-4 py-2 text-left text-sm font-semibold text-[#4a443f] hover:bg-[#f6f4f0]"
                                                                >
                                                                    ✏️ 수정
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveDropdownId(null);
                                                                        setDeleteTarget(product);
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
                            )}
                        </div>

                        {/* 페이지네이션 */}
                        <div className="mt-7 flex items-center justify-center gap-2.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#e9e5dc] bg-white text-[15px] text-[#888] ${
                                    currentPage === 1 ? 'cursor-default opacity-40' : 'cursor-pointer hover:bg-[#f6f4f0]'
                                }`}
                            >
                                &lt;
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={
                                        page === currentPage
                                            ? 'h-[38px] w-[38px] cursor-pointer rounded-[10px] border-none bg-[#4e2d1d] text-[15px] font-semibold text-white'
                                            : 'h-[38px] w-[38px] cursor-pointer rounded-[10px] border border-[#e9e5dc] bg-white text-[15px] font-semibold text-[#666] hover:bg-[#f6f4f0]'
                                    }
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#e9e5dc] bg-white text-[15px] text-[#888] ${
                                    currentPage === totalPages ? 'cursor-default opacity-40' : 'cursor-pointer hover:bg-[#f6f4f0]'
                                }`}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== */}
            {/* 수정 모달 영역                   */}
            {/* ============================== */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <div className="w-[440px] rounded-3xl border border-[#e9e5dc] bg-white p-8 shadow-2xl">
                        <h3 className="mb-1 text-xl font-bold text-[#2b2523]">상품 정보 수정</h3>
                        <p className="mb-6 text-sm text-[#8c857b]">수정할 원두 상품의 정보를 입력해 주세요.</p>

                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-[#444]">상품명</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-3 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                            />

                            <label className="mt-2 text-sm font-semibold text-[#444]">가격</label>
                            <div className="relative flex items-center">
                                <span className="pointer-events-none absolute left-4 text-[15px] text-[#888]">₩</span>
                                <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full rounded-xl border border-[#d9d4cb] bg-white py-3 pl-9 pr-9 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                                />
                                <span className="pointer-events-none absolute right-4 text-sm text-[#888]">원</span>
                            </div>

                            <label className="mt-2 text-sm font-semibold text-[#444]">이미지 URL</label>
                            <input
                                type="text"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                className="rounded-xl border border-[#d9d4cb] bg-white px-4 py-3 text-[15px] text-[#2b2523] outline-none transition focus:border-[#4e2d1d]"
                            />

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditTarget(null)}
                                    className="cursor-pointer rounded-xl border border-[#e9e5dc] bg-white px-5 py-3 text-sm font-semibold text-[#666] hover:bg-[#f6f4f0]"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-xl bg-[#4e2d1d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3b2216]"
                                >
                                    저장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================== */}
            {/* 삭제 모달 영역                   */}
            {/* ============================== */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <div className="w-[380px] rounded-3xl border border-[#e9e5dc] bg-white p-7 shadow-2xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                            🗑️
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-[#2b2523]">상품 삭제</h3>
                        <p className="text-sm leading-relaxed text-[#6d665e]">
                            <strong className="text-[#2b2523]">{deleteTarget.name}</strong> 상품을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="cursor-pointer rounded-xl border border-[#e9e5dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#666] hover:bg-[#f6f4f0]"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="cursor-pointer rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b91c1c]"
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}