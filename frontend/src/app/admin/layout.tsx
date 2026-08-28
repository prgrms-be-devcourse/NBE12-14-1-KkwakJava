'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
      <div className="min-h-screen w-full bg-[#F6F5F2]">
        <header className="flex h-16 w-full items-center justify-between border-b border-[#EAE7E1] bg-white px-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>

            <span className="text-lg font-bold text-[#2B2523]">
            Grids & Circles
          </span>

            <span className="ml-1 text-xs font-semibold text-[#A08D80]">
            ADMIN
          </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
                href="/admin/delivery"
                className={`pb-1 text-sm font-semibold no-underline ${
                    pathname.includes('/admin/delivery')
                        ? 'border-b-2 border-[#523120] text-[#523120]'
                        : 'text-[#8C857B]'
                }`}
            >
              배송 관리
            </Link>

            <Link
                href="/admin/orders"
                className={`pb-1 text-sm font-semibold no-underline ${
                    pathname.includes('/admin/orders')
                        ? 'border-b-2 border-[#523120] text-[#523120]'
                        : 'text-[#8C857B]'
                }`}
            >
              주문 관리
            </Link>

            <Link
                href="/admin/product"
                className={`pb-1 text-sm font-semibold no-underline ${
                    pathname.includes('/admin/product')
                        ? 'border-b-2 border-[#523120] text-[#523120]'
                        : 'text-[#8C857B]'
                }`}
            >
              상품 관리
            </Link>
          </nav>
        </header>

        <main className="w-full">
          {children}
        </main>
      </div>
  );
}