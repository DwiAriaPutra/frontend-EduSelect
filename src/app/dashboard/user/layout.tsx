"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  nim: string;
  nama: string;
  role: string;
  gender: string;
  jurusan: string;
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (e) {
      console.error("Error parsing user data", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();

    setUser(null);
    router.replace("/login");
    router.refresh();
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getTitle = () => {
    if (pathname === "/dashboard/user") return "Beranda Mahasiswa";
    if (pathname === "/dashboard/user/pemilihan") return "Pilih Lokasi Seleksi";
    if (pathname === "/dashboard/user/profil") return "Informasi Profil";
    if (pathname === "/dashboard/user/notifikasi") return "Notifikasi & Pesan";
    return "Dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="bg-background text-on-background antialiased min-h-screen flex"
      style={{ colorScheme: "light" }}
    >
      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 h-20 w-full flex flex-col z-50 bg-surface-container-low border-t border-outline-variant shadow-sm transition-all duration-300 md:top-0 md:bottom-auto md:h-full md:w-64 md:border-r md:border-t-0">
        {/* Brand */}
        <div className="hidden p-6 mb-2 md:block">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-bold">school</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight">EduSelect</h1>
              <p className="text-[10px] text-outline font-bold uppercase tracking-[0.15em]">Portal Mahasiswa</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="grid h-full grid-cols-3 gap-1 px-2 py-2 md:block md:h-auto md:flex-grow md:px-4 md:py-0 md:space-y-1">
          <NavItem 
            href="/dashboard/user" 
            icon="dashboard" 
            label="Dashboard" 
            isActive={pathname === "/dashboard/user"} 
          />
          <NavItem 
            href="/dashboard/user/pemilihan" 
            icon="location_on" 
            label="Pilih Lokasi" 
            isActive={pathname === "/dashboard/user/pemilihan"} 
          />
          <div className="hidden my-4 mx-2 border-t border-outline-variant opacity-50 md:block"></div>
          <NavItem 
            href="/dashboard/user/profil" 
            icon="person" 
            label="Profil Saya" 
            isActive={pathname === "/dashboard/user/profil"} 
          />
        </nav>

        {/* Footer / User Profile */}
        <div className="hidden p-4 mt-auto md:block">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs ring-2 ring-white">
                {getInitials(user?.nama || "")}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-on-surface truncate">{user?.nama}</p>
                <p className="text-[10px] text-outline truncate">{user?.nim}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-error/20 bg-error/10 py-2.5 text-xs font-bold text-error transition-all duration-200 hover:bg-error/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar Akun
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen flex-grow flex flex-col pb-24 md:ml-64 md:pb-0">
        {/* TopAppBar Shell */}
        <header className="sticky top-0 right-0 min-h-16 flex justify-between items-center gap-4 px-4 py-3 z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant md:h-16 md:px-8 md:py-0">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-on-surface tracking-tight md:text-lg">{getTitle()}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/user/notifikasi">
              <TopBarButton icon="notifications" badge />
            </Link>
            <div className="hidden h-6 w-[1px] bg-outline-variant mx-2 sm:block"></div>
            <div className="hidden sm:block">
              <TopBarButton icon="settings" />
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-error/20 bg-error/10 text-error transition-colors hover:bg-error/20 md:hidden"
              title="Keluar Akun"
              aria-label="Keluar Akun"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string; icon: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex h-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition-all duration-200 font-bold text-[11px] group md:h-auto md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-left md:text-sm ${
        isActive
          ? "bg-primary text-on-primary shadow-md shadow-primary/20"
          : "text-outline hover:bg-surface-container hover:text-primary"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${isActive ? "fill-1" : ""}`}
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span>{label}</span>
      {isActive && <div className="hidden ml-auto w-1.5 h-1.5 rounded-full bg-on-primary md:block"></div>}
    </Link>
  );
}

function TopBarButton({ icon, badge }: { icon: string; badge?: boolean }) {
  return (
    <button className="relative p-2.5 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {badge && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
      )}
    </button>
  );
}
