'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SpotTourism {
  spot_id: string;
  spot_name: string;
  spot_desc: string;
  spot_thumbnail: string;
}

export default function HomepageUser() {
  const [spots, setSpots] = useState<SpotTourism[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/destination");
        const data = await res.json();
        setSpots(data);
      } catch (error) {
        console.error("Gagal memuat data wisata", error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">

      <section className="p-8 text-center">
        <h2 className="text-3xl font-semibold mb-2">Selamat Datang!</h2>
        <p className="text-gray-600">Temukan dan beli tiket tempat wisata terbaik di Baturraden.</p>
      </section>

      <section className="p-6">
        <h3 className="text-2xl font-semibold mb-4">Tempat Wisata Populer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <div key={spot.spot_id} className="bg-white rounded shadow p-4">
              <Image
                src={spot.spot_thumbnail || "/default-image.jpg"}
                alt={spot.spot_name}
                width={400}
                height={160}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h4 className="text-lg font-bold">{spot.spot_name}</h4>
              <p className="text-sm text-gray-600">{spot.spot_desc}</p>
              <Link href={`/user/destination/${spot.spot_id}`} className="text-blue-500 mt-2 inline-block">
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
