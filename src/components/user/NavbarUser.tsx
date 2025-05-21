'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NavbarUser() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUser = () => {
      const data = localStorage.getItem('user')
      if (data) {
        setUser(JSON.parse(data))
      } else {
        setUser(null)
      }
    }

    loadUser()

    window.addEventListener('userChanged', loadUser)
    return () => window.removeEventListener('userChanged', loadUser)
  }, [])

  const handleLogout = () => {
    setShowConfirm(false) // tutup modal dulu

    // Tunggu sedikit supaya animasi/modal hilang
    setTimeout(() => {
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('userChanged'))
      router.push('/user/login')
    }, 100) // 100ms sudah cukup
  }

  return (
    <>
      <nav className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/user" aria-label="Beranda" className="text-xl font-bold hover:bg-gray-100 px-2 py-1 rounded">
            Baturraden Tourism
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <button onClick={() => setShowConfirm(true)} className="text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/user/login">Login</Link>
            )}
            <Link href="/user/payment">Riwayat</Link>
          </div>

          {/* Hamburger Button */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden mt-2 flex flex-col space-y-2">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <button onClick={() => setShowConfirm(true)} className="text-red-600 text-left">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/user/login">Login</Link>
            )}
            <Link href="/user/payment">Riwayat</Link>
          </div>
        )}
      </nav>

      {/* Modal Konfirmasi Logout */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Logout</h2>
            <p className="mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
