import type { ReactNode } from 'react'
import UserHeader from '@/components/user/UserHeader'

interface UserLayoutProps {
  children: ReactNode
}

export default function UserLayout({
                                     children,
                                   }: UserLayoutProps) {
  return (
      <>
        <UserHeader />
        {children}
      </>
  )
}