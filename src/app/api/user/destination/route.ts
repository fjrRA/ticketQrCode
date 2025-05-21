import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const data = await prisma.spot_tourism.findMany({
      include: {
        galleries: true,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan' }, { status: 500 });
  }
}
