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
      <div style={{ minHeight: '100vh', backgroundColor: '#f6f5f2' }}>
        {/* 상단 네비게이션 헤더 */}
        <header
            style={{
              height: 64,
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #eae7e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 40px',
            }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>☕</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2b2523' }}>
            Grids & Circles
          </span>
          </div>

          <nav style={{ display: 'flex', gap: 24 }}>
            {/* 배송 관리 (주문 관리 왼쪽 위치) */}
            <Link
                href="/admin/delivery"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: pathname.includes('/admin/delivery') ? '#523120' : '#8c857b',
                  borderBottom: pathname.includes('/admin/delivery') ? '2px solid #523120' : 'none',
                  paddingBottom: 4,
                }}
            >
              배송 관리
            </Link>
            <Link
                href="/admin/orders"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: pathname.includes('/admin/orders') ? '#523120' : '#8c857b',
                  borderBottom: pathname.includes('/admin/orders') ? '2px solid #523120' : 'none',
                  paddingBottom: 4,
                }}
            >
              주문 관리
            </Link>
            <Link
                href="/admin/product"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: pathname.includes('/admin/product') ? '#523120' : '#8c857b',
                  borderBottom: pathname.includes('/admin/product') ? '2px solid #523120' : 'none',
                  paddingBottom: 4,
                }}
            >
              상품 관리
            </Link>
          </nav>
        </header>

        {/* 본문 콘텐츠 영역 */}
        <main>{children}</main>
      </div>
  );
}