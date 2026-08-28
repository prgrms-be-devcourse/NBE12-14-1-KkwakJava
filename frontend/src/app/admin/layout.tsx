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

  const navItems = [
    { label: '배송 관리', href: '/admin/delivery' },
    { label: '주문 관리', href: '/admin/orders' },
    { label: '상품 관리', href: '/admin/product' },
  ];

  return (
      <div className="min-h-screen bg-[#f6f5f2]">
        {/* 상단 네비게이션 헤더 */}
        <header className="h-16 bg-white border-b border-[#eae7e1] flex items-center justify-between px-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="text-lg font-bold text-[#2b2523]">
            Grids & Circles Admin
          </span>
          </div>

          <nav className="flex gap-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-semibold pb-1 transition-colors ${
                          isActive
                              ? 'text-[#523120] border-b-2 border-[#523120]'
                              : 'text-[#8c857b] hover:text-[#523120]'
                      }`}
                  >
                    {item.label}
                  </Link>
              );
            })}
          </nav>
        </header>

        {/* 본문 콘텐츠 */}
        <main>{children}</main>
      </div>
  );
}