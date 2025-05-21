import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';

interface MidtransCallbackResponse {
  transaction_status: string;
  order_id: string;
  payment_type: string;
}

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔥 CALLBACK DARI MIDTRANS MASUK");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const response: MidtransCallbackResponse = req.body;
  console.log("Callback Data:", response);

  const isValid = validateMidtransSignature(response);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid callback data' });
  }

  const { order_id, transaction_status, payment_type } = response;
  const isPaid = ['settlement', 'capture', 'accept'].includes(transaction_status);

  try {
    const existing = await prisma.transaction.findUnique({
      where: { transaction_code: order_id },
    });

    if (existing) {
      if (existing.transaction_status !== 'paid' && isPaid) {
        await prisma.transaction.update({
          where: { transaction_code: order_id },
          data: { transaction_status: 'paid' },
        });

        await prisma.payment.updateMany({
          where: { reference_number: order_id },
          data: {
            payment_status: 'success',
            payment_time: new Date(),
          },
        });

        console.log("✅ Status transaksi diperbarui menjadi PAID.");
        return res.status(200).json({ message: 'Transaction updated to paid' });
      }

      console.log("⚠️ Transaksi sudah ada, tidak disimpan ulang.");
      return res.status(200).json({ message: 'Transaction already exists' });
    }

    const tempOrder = await prisma.temp_order.findUnique({
      where: { order_id },
      include: { details: true },
    });

    console.log("Temp Order Found:", tempOrder);

    if (!tempOrder) {
      console.warn("❌ Temp order tidak ditemukan");
      return res.status(404).json({ error: 'Temp order not found' });
    }

    const total_price = tempOrder.details.reduce((sum, item) => sum + Number(item.subtotal), 0);

    console.log("Akan menyimpan transaksi ke database...");

    const createdTransaction = await prisma.transaction.create({
      data: {
        transaction_code: order_id,
        user_id: tempOrder.user_id,
        total_price,
        visit_date: tempOrder.visit_date,
        transaction_status: isPaid ? 'paid' : 'pending',
        transaction_date: new Date(),
        transaction_details: {
          create: tempOrder.details.map((item) => ({
            ticket_id: item.ticket_id,
            detail_quantity: item.quantity,
            detail_price: item.price,
            detail_subtotal: item.subtotal,
            visitor_name: item.visitor_name,
          })),
        },
      },
    });

    await prisma.payment.create({
      data: {
        transaction_id: createdTransaction.transaction_id,
        reference_number: order_id,
        payment_type,
        payment_amount: total_price,
        payment_status: isPaid ? 'success' : 'pending',
        payment_time: new Date(),
        response_data: req.body,
      },
    });

    await prisma.temp_order_detail.deleteMany({
      where: { temp_order_id: tempOrder.temp_order_id },
    });

    await prisma.temp_order.delete({
      where: { temp_order_id: tempOrder.temp_order_id },
    });

    console.log("✅ Transaksi berhasil disimpan.");
    return res.status(200).json({ message: 'Transaction saved & temp order deleted' });

  } catch (error) {
    console.error('Midtrans Callback Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function validateMidtransSignature(response: MidtransCallbackResponse): boolean {
  console.log("Callback Midtrans:", response);
  return true;
}
