'use client';

import { useEffect, useState } from 'react';

type Transaction = {
  transaction_code: string;
  transaction_date: string;
  transaction_status: string;
  total_price: number;
  transaction_details: {
    ticket: {
      ticket_name: string;
    };
    visitor_name: string;
    detail_price: number;
    detail_subtotal: number;
    transaction_detail_id: number;
  }[];
};

export default function PaymentHistoryPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    fetch(`/api/user/transaction/route?user_id=${user.user_id}`)
      .then((res) => res.json())
      .then((result) => {
        console.log("HASIL DARI API:", result);
        setData(result);
      })
      .catch((err) => {
        console.error("Gagal fetch data transaksi:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredData = statusFilter === 'all'
    ? data
    : data.filter(trx => trx.transaction_status === statusFilter);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Riwayat Pembelian Tiket</h1>

      {/* 🔽 Filter Status */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Semua</option>
          <option value="paid">PAID</option>
          <option value="pending">PENDING</option>
        </select>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500">Belum ada transaksi yang sesuai filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredData.map((trx, index) => (
            <div key={index} className="border p-4 rounded shadow-sm">
              <p className="font-semibold">Kode Transaksi: {trx.transaction_code}</p>
              <p>Tanggal: {new Date(trx.transaction_date).toLocaleString('id-ID')}</p>
              <p>Status: <span className={
                trx.transaction_status === 'paid' ? 'text-green-600 font-semibold' :
                  trx.transaction_status === 'pending' ? 'text-yellow-600 font-semibold' :
                    'text-red-600 font-semibold'
              }>
                {trx.transaction_status.toUpperCase()}
              </span></p>

              <div className="mt-2">
                {trx.transaction_details.map((detail, idx) => (
                  <div key={idx} className="mb-2 p-2 border rounded bg-gray-50">
                    <p className="text-sm">
                      <strong>Nama Pengunjung:</strong> {detail.visitor_name}
                    </p>
                    <p className="text-sm">
                      <strong>Nama Tiket:</strong> {detail.ticket.ticket_name}
                    </p>
                    <p className="text-sm">
                      <strong>Subtotal:</strong> Rp {detail.detail_subtotal.toLocaleString('id-ID')}
                    </p>
                    {trx.transaction_status === 'paid' && (
                      <a
                        href={`/api/ticket/pdf?id=${detail.transaction_detail_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="bg-green-600 text-white px-4 py-1 rounded mt-2 hover:bg-green-700">
                          Download Tiket
                        </button>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-2 font-semibold text-blue-600">
                Total Harga: Rp {trx.total_price.toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
