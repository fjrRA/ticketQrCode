import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';
import { TransactionStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { user_id, status } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'User ID tidak valid' });
  }

  let statusFilter: TransactionStatus | undefined = undefined;
  if (typeof status === 'string' && ['paid', 'pending', 'cancelled'].includes(status)) {
    statusFilter = status as TransactionStatus;
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id,
        ...(statusFilter && { transaction_status: statusFilter }),
      },
      include: {
        transaction_details: {
          select: {
            transaction_detail_id: true, // ✅ Tambahkan baris ini
            visitor_name: true,
            detail_quantity: true,
            detail_price: true,
            detail_subtotal: true,
            ticket: {
              select: {
                ticket_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        transaction_date: 'desc',
      },
    });

    res.status(200).json(transactions);
  } catch (err) {
    console.error('Gagal mengambil data transaksi:', err);
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
}
