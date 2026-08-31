'use client';

import { useEffect, useState } from 'react';
import { getProducts, updateProduct, deleteProduct } from '@/api/productApi';
import type { ProductResponse, ProductUpdateRequest } from '@/types/product';

import ProductCreateForm from '@/components/admin/product/ProductCreateForm';
import ProductList from '@/components/admin/product/ProductList';
import ProductEditModal from '@/components/admin/product/ProductEditModal';
import ProductDeleteModal from '@/components/admin/product/ProductDeleteModal';

const ITEMS_PER_PAGE = 8;

export default function AdminProductPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [editModalProduct, setEditModalProduct] = useState<ProductResponse | null>(null);
    const [deleteModalProduct, setDeleteModalProduct] = useState<ProductResponse | null>(null);

    /* 상품 목록 조회 */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error(err);
                alert(
                    err instanceof Error
                        ? err.message
                        : '상품 목록을 불러오는데 실패했습니다.'
                );
            }
        };
        fetchProducts();
    }, []);

    /* 페이지네이션 계산 */
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    /* 상품 등록 핸들러 */
    const handleCreated = (product: ProductResponse) => {
        setProducts((prev) => [product, ...prev]);
        setCurrentPage(1);
    };

    /* 상품 수정 저장 핸들러 */
    const handleSaveEdit = async (id: number, data: ProductUpdateRequest) => {
        const updatedProduct = await updateProduct(id, data);
        setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
    };

    /* 상품 삭제 확인 핸들러 */
    const handleConfirmDelete = async (id: number) => {
        await deleteProduct(id);
        const updatedProducts = products.filter((p) => p.id !== id);
        setProducts(updatedProducts);

        const newTotalPages = Math.ceil(updatedProducts.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    };

    return (
        <div className="w-full px-12 py-[50px]">
            <div className="mx-auto max-w-[1200px]">
                <div className="flex items-start gap-9">
                    {/* 등록 폼 */}
                    <ProductCreateForm onCreated={handleCreated} />

                    {/* 목록 카드 */}
                    <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[#e9e5dc] bg-white px-9 py-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                        <div>
                            <div className="mb-6 flex items-center gap-3">
                                <span className="text-xl font-bold text-[#2b2523]">
                                    등록된 카페 상품
                                </span>
                                <span className="rounded-md border border-[#e9e5dc] bg-[#f6f4f0] px-3 py-1 text-sm font-semibold text-[#6d665e]">
                                    총 {products.length}건
                                </span>
                            </div>

                            <ProductList
                                products={currentProducts}
                                onEdit={(product) => setEditModalProduct(product)}
                                onDelete={(product) => setDeleteModalProduct(product)}
                            />
                        </div>

                        {/* 페이지네이션 */}
                        <div className="mt-7 flex items-center justify-center gap-2.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#e9e5dc] bg-white text-[15px] text-[#888] ${
                                    currentPage === 1
                                        ? 'cursor-default opacity-40'
                                        : 'cursor-pointer hover:bg-[#f6f4f0]'
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
                                    currentPage === totalPages
                                        ? 'cursor-default opacity-40'
                                        : 'cursor-pointer hover:bg-[#f6f4f0]'
                                }`}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 수정 모달 */}
            {editModalProduct && (
                <ProductEditModal
                    product={editModalProduct}
                    onClose={() => setEditModalProduct(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* 삭제 모달 */}
            {deleteModalProduct && (
                <ProductDeleteModal
                    product={deleteModalProduct}
                    onClose={() => setDeleteModalProduct(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
}