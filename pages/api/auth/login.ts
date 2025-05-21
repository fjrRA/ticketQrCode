// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email } = req.body

  if (!email) return res.status(400).json({ error: 'Email wajib diisi' })

  let user = await prisma.users.findUnique({ where: { email } })

  // Buat user jika belum ada
  if (!user) {
    const newUserId = `U${Date.now().toString().slice(-9)}` // max 10 karakter
    user = await prisma.users.create({
      data: {
        user_id: newUserId,
        name,
        email,
        password: '-', // karena pakai Firebase
        role: 'user',
      },
    })
  }

  // ✅ Kirim kembali user_id ke frontend
  return res.status(200).json({ user_id: user.user_id })
}
