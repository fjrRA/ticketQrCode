/*
  Refactored TicketList.tsx to support multi-ticket purchase with dynamic name input
*/

'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Ticket } from '@/types/ticket';
import { MidtransTransactionResult } from '@/types/midtrans';

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [visitorNames, setVisitorNames] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    setVisitorNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < value) newNames.push('');
      return newNames.slice(0, value);
    });
  };

  const handleVisitorNameChange = (index: number, value: string) => {
    setVisitorNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleBuyTicket = async () => {
    const userData = localStorage.getItem("user");
    if (!userData || !selectedTicket) return;

    const user = JSON.parse(userData);
    const visit_date = new Date();
    setIsPaying(true);

    const items = visitorNames.map((name) => ({
      ticket_id: selectedTicket.ticket_id,
      visitor_name: name,
      quantity: 1,
      price: selectedTicket.ticket_price,
    }));

    try {
      const orderRes = await fetch("/api/order/temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, visit_date, items }),
      });

      const orderData = await orderRes.json();
      const order_id = orderData.order_id;

      const snapRes = await fetch("/api/payment/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id }),
      });

      const snapData = await snapRes.json();

      if (snapData.snapToken) {
        setSelectedTicket(null); // Tutup dialog HANYA JIKA snapToken tersedia

        window.snap.pay(snapData.snapToken, {
          onSuccess: (result: MidtransTransactionResult) => console.log(result),
          onPending: (result: MidtransTransactionResult) => console.log(result),
          onError: (error: Error) => console.error(error),
          onClose: () => console.log("User closed popup"),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Tiket Tersedia</h3>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.ticket_id} className="bg-white p-4 rounded shadow">
            <h4 className="font-bold">{ticket.ticket_name}</h4>
            <p className="text-sm">{ticket.ticket_desc || "No description"}</p>
            <p className="text-lg font-semibold">
              Rp {ticket.ticket_price.toLocaleString('id-ID')}
            </p>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
              onClick={() => {
                const user = JSON.parse(localStorage.getItem("user") || '{}');

                if (!user?.user_id) {
                  setShowLoginDialog(true); // 👈 Tampilkan dialog login
                  return;
                }

                setSelectedTicket(ticket);
                setQuantity(1);
                setVisitorNames([user.name || '']);
              }}
            >
              Beli Sekarang
            </button>
          </div>
        ))}
      </div>

      {/* 🧾 Dialog Form Input */}
      <Dialog.Root open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed z-50 bg-white rounded-lg shadow-lg p-6 max-w-md w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Dialog.Title className="text-lg font-semibold">Isi Data Pengunjung</Dialog.Title>
            <label className="block mt-4">Jumlah Tiket:
              <input type="number" min={1} max={10} value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="block w-full mt-1 p-2 border rounded" />
            </label>
            {visitorNames.map((name, idx) => (
              <div key={idx} className="mt-2">
                <label>Nama Pengunjung {idx + 1}:
                  <input type="text" value={name}
                    onChange={(e) => handleVisitorNameChange(idx, e.target.value)}
                    className="block w-full mt-1 p-2 border rounded" />
                </label>
              </div>
            ))}
            <div className="mt-4 flex justify-end space-x-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded bg-gray-300">Batal</button>
              </Dialog.Close>
              <button
                onClick={handleBuyTicket}
                disabled={isPaying}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {isPaying ? "Processing..." : "Bayar Sekarang"}
              </button>

            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 🔒 Dialog Login Warning */}
      <Dialog.Root open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed z-50 bg-white rounded-lg shadow-lg p-6 max-w-sm w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Dialog.Title className="text-lg font-semibold">Akses Dibatasi</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mt-2">
              Silakan login terlebih dahulu untuk membeli tiket.
            </Dialog.Description>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={() => window.location.href = "/user/login"}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Login Sekarang
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}