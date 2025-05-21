'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionChart from "@/components/admin/dashboard/TransactionChart";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import PaymentPieChart from "@/components/admin/dashboard/PaymentPieChart";

type Summary = {
  transaksi: { total: number; paid: number; cancelled: number; pending: number }
  pendapatan: { total: number; metodeTerbanyak: string }
  kunjungan: { hariIni: number; mingguIni: number }
  pengguna: { total: number; beli: number }
  populer: { nama: string }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Summary | null>(null)

  useEffect(() => {
    fetch("/api/admin/dashboard/summary") // atau extended-summary.ts jika kamu pakai itu
      .then((res) => res.json())
      .then(setData)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data ? data.transaksi.total : "-"}
            </p>
            <p className="text-sm text-muted-foreground">Total transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data ? `Rp ${data.pendapatan.total.toLocaleString()}` : "-"}
            </p>
            <p className="text-sm text-muted-foreground">Total pembayaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kunjungan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data ? data.kunjungan.hariIni : "-"}
            </p>
            <p className="text-sm text-muted-foreground">Jadwal kunjungan hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinasi Populer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {data ? data.populer.nama : "-"}
            </p>
            <p className="text-sm text-muted-foreground">Berdasarkan tiket terbanyak</p>
          </CardContent>
        </Card>
      </div>

      <PaymentPieChart />

      {/* 👇 Tambahkan grafik dan section lanjutan di bawah ini */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <TransactionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <RevenueChart />
        </div>
      </div>
    </div>
  )
}
