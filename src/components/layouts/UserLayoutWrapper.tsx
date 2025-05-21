'use client'

import NavbarUser from '@/components/user/NavbarUser'

export default function UserLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarUser />
      <main>{children}</main>
    </>
  )
}
