'use client'

import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '@lib/firebase'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'user' | 'admin'>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleUserLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      localStorage.removeItem("user")

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
        }),
      })

      const data = await res.json()

      localStorage.setItem("user", JSON.stringify({
        user_id: data.user_id,
        name: user.displayName,
        email: user.email,
      }))

      window.dispatchEvent(new Event("userChanged"))
      router.push("/user")
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  const handleAdminLogin = async () => {
    setError('')
    try {
      const res = await fetch("/api/auth/login-admin", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const msg = await res.json()
        setError(msg.message || 'Login gagal')
        return
      }

      const data = await res.json()
      document.cookie = `token=${data.token}; path=/; max-age=86400`
      router.push("/admin")
    } catch (err) {
      console.error("Login admin error:", err)
      setError("Terjadi kesalahan")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded p-8 max-w-md w-full">
        <div className="flex justify-between mb-6">
          <button onClick={() => setMode('user')} className={`w-1/2 p-2 ${mode === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            Login User
          </button>
          <button onClick={() => setMode('admin')} className={`w-1/2 p-2 ${mode === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            Login Admin
          </button>
        </div>

        {mode === 'user' ? (
          <>
            <h1 className="text-2xl font-semibold text-center mb-6">Login User</h1>
            <button
              onClick={handleUserLogin}
              className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
            >
              Login dengan Gmail
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-center mb-6">Login Admin</h1>
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-3 p-2 border rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button
              onClick={handleAdminLogin}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Login Admin
            </button>
          </>
        )}
      </div>
    </div>
  )
}
