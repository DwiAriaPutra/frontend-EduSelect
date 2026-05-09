"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  nim: string;
  nama: string;
  role: string;
}

export default function AdminDashboardLayout({
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
      if (userData.role !== "admin") {
        router.push("/dashboard/user");
        return;
      }
      setUser(userData);
    } catch (e) {
      console.error("Error parsing user data", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getTitle = () => {
    if (pathname === "/dashboard/admin") return "Ringkasan Dashboard";
    if (pathname === "/dashboard/admin/tempat") return "Daftar Lokasi Seleksi";
    if (pathname === "/dashboard/admin/tambah-tempat")
      return "Tambah Lokasi Baru";
    if (pathname === "/dashboard/admin/profil") return "Pengaturan Profil";
    if (pathname === "/dashboard/admin/notifikasi") return "Notifikasi Sistem";
    return "Admin Panel";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background antialiased min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-50 bg-surface-container-low border-r border-outline-variant shadow-sm transition-all duration-300">
        {/* Brand */}
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-bold">
                school
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight">
                EduSelect
              </h1>
              <p className="text-[10px] text-outline font-bold uppercase tracking-[0.15em]">
                Portal Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-4 space-y-1">
          <NavItem
            href="/dashboard/admin"
            icon="dashboard"
            label="Dashboard"
            isActive={pathname === "/dashboard/admin"}
          />
          <NavItem
            href="/dashboard/admin/tempat"
            icon="location_on"
            label="Kelola Lokasi"
            isActive={pathname === "/dashboard/admin/tempat"}
          />
          <NavItem
            href="/dashboard/admin/tambah-tempat"
            icon="add_location"
            label="Tambah Lokasi"
            isActive={pathname === "/dashboard/admin/tambah-tempat"}
          />
          <div className="my-4 mx-2 border-t border-outline-variant opacity-50"></div>
          <NavItem
            href="/dashboard/admin/profil"
            icon="person"
            label="Profil Saya"
            isActive={pathname === "/dashboard/admin/profil"}
          />
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 mt-auto">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm ring-2 ring-white">
                {user?.nama?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-on-surface truncate">
                  {user?.nama}
                </p>
                <p className="text-[10px] text-outline truncate">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl transition-all duration-200 text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              Keluar Akun
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 right-0 h-16 flex justify-between items-center px-8 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">
              {getTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/notifikasi">
              <TopBarButton icon="notifications" badge />
            </Link>
            <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
            <TopBarButton icon="settings" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-grow">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm group ${
        isActive
          ? "bg-primary text-on-primary shadow-md shadow-primary/20"
          : "text-outline hover:bg-surface-container hover:text-primary"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${
          isActive ? "fill-1" : ""
        }`}
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span>{label}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-on-primary"></div>
      )}
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
