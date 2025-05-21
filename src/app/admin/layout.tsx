import Sidebar from "@/components/admin/Sidebar";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar tetap fixed di kiri */}
      <Sidebar />

      {/* Kontainer kanan: konten utama dan footer */}
      <div className="flex flex-col flex-1 min-h-screen ml-64">
        <main className="flex-1 p-6">
          {children}
          <Toaster />
        </main>

        <footer className="p-4 text-center text-xs text-muted-foreground border-t bg-white">
          © {new Date().getFullYear()} Baturraden Admin. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
