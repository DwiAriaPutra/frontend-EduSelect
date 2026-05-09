"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalLocations: number;
  totalQuota: number;
  totalFilled: number;
  recentLocations: Array<{
    id: number;
    nama_lokasi: string;
    alamat: string;
    total_capacity: string | number;
    total_filled: string | number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/dashboard/user");
      return;
    }

    setAdminName(user.nama);

    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(response.data);
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getLocationStatus = (capacity: number, filled: number) => {
    const percentage = capacity > 0 ? (filled / capacity) * 100 : 0;

    if (percentage >= 100) {
      return {
        label: "Penuh",
        className: "bg-slate-200 text-slate-600",
        percentage,
      };
    }

    if (percentage >= 80) {
      return {
        label: "Hampir Penuh",
        className: "bg-orange-100 text-orange-700",
        percentage,
      };
    }

    return {
      label: "Tersedia",
      className: "bg-green-100 text-green-700",
      percentage,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-10 sm:px-6 md:px-8 md:py-8 md:pb-12">
      {/* Quick Actions & Welcome */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-on-surface mb-1">
            Selamat Datang, {adminName}
          </h2>
          <p className="text-outline font-medium">
            Berikut adalah ringkasan sistem pemilihan lokasi seleksi.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/tambah-tempat")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 sm:text-base md:w-auto md:px-6"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="truncate">Tambah Lokasi Baru</span>
        </button>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Locations */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined">map</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-outline text-xs font-bold uppercase tracking-wider mb-1">
              Total Lokasi
            </span>
            <span className="text-3xl font-bold text-on-surface">
              {stats?.totalLocations}
            </span>
          </div>
        </div>

        {/* Card 2: Total Quotas */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined">group_add</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-outline text-xs font-bold uppercase tracking-wider mb-1">
              Total Kuota
            </span>
            <span className="text-3xl font-bold text-on-surface">
              {stats?.totalQuota.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Registered Students */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-outline text-xs font-bold uppercase tracking-wider mb-1">
              Mahasiswa Terdaftar
            </span>
            <span className="text-3xl font-bold text-on-surface">
              {stats?.totalUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Visualization & Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Pantau Lokasi Card */}
        <div className="lg:col-span-3 bg-primary text-on-primary p-5 rounded-2xl overflow-hidden relative flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-lg shadow-primary/20 sm:p-8">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Pantau Lokasi</h3>
            {/* Perbaikan di baris bawah ini: Menambahkan w-full atau w-72 dan menghapus max-w-md jika dirasa terlalu sempit */}
            <p className="text-sm opacity-90 mb-6 w-full md:w-80 leading-relaxed">
              {stats?.totalFilled} dari {stats?.totalQuota} kuota telah terisi
              oleh mahasiswa yang melakukan pemilihan.
            </p>
            <button
              onClick={() => router.push("/dashboard/admin/tempat")}
              className="px-6 py-2.5 bg-white text-primary rounded-xl text-sm font-bold active:scale-95 transition-all w-fit shadow-md"
            >
              Lihat Detail Pengisian
            </button>
          </div>
          {/* Icon background tetap sama */}
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 select-none">
            location_searching
          </span>
        </div>

        {/* Aktivitas Terakhir Card */}
        <div className="lg:col-span-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-6">
            Status Pengisian Global
          </h3>
          <div className="flex flex-col items-center justify-center h-full pb-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {stats && stats.totalQuota > 0
                ? Math.round((stats.totalFilled / stats.totalQuota) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-outline font-bold">Kuota Terisi</div>
            <div className="w-full bg-surface-container-highest h-3 rounded-full mt-6 overflow-hidden border border-outline-variant/30">
              <div
                className="bg-primary h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${
                    stats && stats.totalQuota > 0
                      ? (stats.totalFilled / stats.totalQuota) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Mini List */}
      <div className="mt-12 mb-8">
        <div className="flex flex-col gap-3 mb-6 px-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold text-on-surface">Lokasi Terbaru</h3>
          <Link
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            href="/dashboard/admin/tempat"
          >
            Lihat Semua Lokasi
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </Link>
        </div>

        <div className="space-y-4 md:hidden">
          {stats?.recentLocations.map((loc) => {
            const capacity = Number(loc.total_capacity) || 0;
            const filled = Number(loc.total_filled) || 0;
            const status = getLocationStatus(capacity, filled);

            return (
              <article
                key={loc.id}
                className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-on-surface">
                      {loc.nama_lokasi}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-outline">
                      {loc.alamat}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-container-low p-3">
                    <p className="text-[10px] font-bold uppercase text-outline">
                      Kapasitas
                    </p>
                    <p className="mt-1 text-lg font-bold text-on-surface">
                      {capacity}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-3">
                    <p className="text-[10px] font-bold uppercase text-outline">
                      Terisi
                    </p>
                    <p className="mt-1 text-lg font-bold text-on-surface">
                      {filled}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  href="/dashboard/admin/tempat"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    settings
                  </span>
                  Kelola
                </Link>
              </article>
            );
          })}
          {stats?.recentLocations.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-white p-8 text-center text-sm font-medium text-outline">
              Belum ada data lokasi yang terdaftar.
            </div>
          )}
        </div>

        <div className="hidden bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 md:block">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Nama Lokasi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Terisi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {stats?.recentLocations.map((loc) => {
                const capacity = Number(loc.total_capacity) || 0;
                const filled = Number(loc.total_filled) || 0;
                const status = getLocationStatus(capacity, filled);

                return (
                  <tr
                    key={loc.id}
                    className="hover:bg-surface-container-lowest transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">
                          {loc.nama_lokasi}
                        </span>
                        <span className="text-xs text-outline font-medium">
                          {loc.alamat}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {capacity}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {filled}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href="/dashboard/admin/tempat"
                        className="inline-flex items-center gap-1 px-4 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all text-xs font-bold border border-primary/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          settings
                        </span>
                        Kelola
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {stats?.recentLocations.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-outline text-sm font-medium"
                  >
                    Belum ada data lokasi yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
