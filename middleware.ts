import { NextRequest, NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/user/login', request.url))
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwtDecode(token)
    if (decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/user/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/user/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'], // Proteksi semua halaman admin
}
