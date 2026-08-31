'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function UserHeader() {
  const pathname = usePathname()

  const orderActive = pathname === '/order'
  const deliveryActive = pathname === '/delivery'

  return (
      <header className="flex items-center justify-between border-b border-[#E9E5DC] bg-white px-6 py-4 dark:border-[#4a3b2f] dark:bg-[#2b211a] sm:px-12">
        {/* 로고 */}
        <Link
            href="/order"
            className="flex items-center gap-2 text-lg font-bold text-[#4E2D1D] dark:text-[#e8c9a0]"
        >
        <span aria-hidden="true" className="text-xl leading-none">
          ☕️
        </span>

          Grids &amp; Circles
        </Link>

        {/* 네비게이션 */}
        <nav className="flex gap-6 text-sm">
          <Link
              href="/order"
              className={
                orderActive
                    ? 'border-b-2 border-[#4E2D1D] font-semibold dark:border-[#e8c9a0]'
                    : 'text-[#8a7d70] hover:text-[#2b2420] dark:hover:text-[#f3e9dc]'
              }
          >
            원두 주문
          </Link>

          <Link
              href="/delivery"
              className={
                deliveryActive
                    ? 'border-b-2 border-[#4E2D1D] font-semibold dark:border-[#e8c9a0]'
                    : 'text-[#8a7d70] hover:text-[#2b2420] dark:hover:text-[#f3e9dc]'
              }
          >
            주문·배송 조회
          </Link>
        </nav>
      </header>
  )
}