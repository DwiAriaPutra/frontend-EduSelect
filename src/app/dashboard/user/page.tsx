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
}

interface User {
  id: number;
  nim: string;
  nama: string;
  role: string;
  gender: string;
  jurusan: string;
}

interface Quota {
  id: number;
  gender: string;
  total_max: number;
  current_filled: number;
  current_locked: number;
}

interface Location {
  id: number;
  nama_lokasi: string;
  alamat: string;
  quotas: Quota[];
}

interface Activity {
  activity_type: string;
  description: string;
  created_at: string;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    const fetchData = async () => {
      try {
        // 1. Fetch locations data
        const locResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/locations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 2. Fetch public user stats
        const statsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/public-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 3. Fetch public activities
        const activitiesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/public-activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const locations: Location[] = locResponse.data;
        const publicStats = statsResponse.data;

        let totalQuota = 0;
        let totalFilled = 0;

        locations.forEach((loc) => {
          loc.quotas.forEach((q) => {
            totalQuota += Number(q.total_max);
            totalFilled += Number(q.current_filled);
          });
        });

        setStats({
          totalUsers: publicStats.totalUsers,
          totalLocations: locations.length,
          totalQuota: totalQuota,
          totalFilled: totalFilled,
        });
        setActivities(activitiesResponse.data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-8">
      {/* Welcome Header */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display-md text-on-surface mb-2">
              Selamat Datang, {user?.nama.split(" ")[0]}!
            </h3>
            <p className="font-body-md text-on-surface-variant max-w-2xl">
              Pantau statistik pemilihan lokasi dan informasi terbaru mengenai
              proses pemilihan lokasi KKN.
            </p>
          </div>
          <div className="w-full bg-primary-fixed p-4 rounded-xl flex items-center gap-4 border border-outline-variant/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default md:w-auto">
            <div className="bg-primary-container p-3 rounded-lg text-white">
              <span className="material-symbols-outlined">event_available</span>
            </div>
            <div>
              <p className="text-xs font-label-sm text-on-primary-fixed-variant uppercase tracking-wider">
                Batas Pendaftaran
              </p>
              <p className="font-title-lg text-on-primary-fixed">30 Mei 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined">map</span>
            </div>
            <span className="text-xs font-medium text-tertiary bg-tertiary-fixed px-2 py-1 rounded-full">
              +2 Baru
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">
            Lokasi Terdaftar
          </p>
          <h4 className="text-3xl font-display-md text-on-surface">
            {stats?.totalLocations || 0}
          </h4>
          <p className="text-xs text-on-surface-variant mt-2">
            Wilayah aktif tersedia saat ini
          </p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">
            Mahasiswa Terdaftar
          </p>
          <h4 className="text-3xl font-display-md text-on-surface">
            {stats?.totalUsers ? stats.totalUsers.toLocaleString() : "0"}
          </h4>
          <p className="text-xs text-on-surface-variant mt-2">
            Pendaftar aktif periode ini
          </p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <span className="text-xs font-medium text-error bg-error-container px-2 py-1 rounded-full">
              {stats && stats.totalQuota - stats.totalFilled < 50
                ? "Kritis"
                : "Tersedia"}
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">
            Sisa Kuota Total
          </p>
          <h4 className="text-3xl font-display-md text-on-surface">
            {stats ? stats.totalQuota - stats.totalFilled : 0}
          </h4>
          <p className="text-xs text-on-surface-variant mt-2">
            Segera tentukan pilihan lokasi Anda
          </p>
        </div>
      </section>

      {/* Detailed Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Info Section */}
        <div className="lg:col-span-3 bg-white border border-outline-variant/50 rounded-xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:p-8">
          <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h5 className="font-title-lg text-on-surface">
              Panduan Langkah Selanjutnya
            </h5>
            <button className="text-primary font-label-md hover:underline">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h6 className="font-body-md font-bold mb-1">
                  Verifikasi Data Diri
                </h6>
                <p className="text-sm text-on-surface-variant">
                  Pastikan semua data profil dan dokumen pendukung sudah sesuai
                  dengan identitas asli Anda.
                </p>
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-medium">
                  <span
                    className="material-symbols-outlined text-[14px] mr-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Sudah Selesai
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div className="min-w-0">
                <h6 className="font-body-md font-bold mb-1">
                  Pilih Lokasi KKN
                </h6>
                <p className="text-sm text-on-surface-variant">
                  Pilih lokasi yang tersedia berdasarkan sisa kuota. Anda dapat
                  membandingkan fasilitas antar lokasi.
                </p>
                <div className="mt-4 flex">
                  <Link
                    href="/dashboard/user/pemilihan"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-container sm:w-auto"
                  >
                    Pilih Sekarang
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h6 className="font-body-md font-bold mb-1">
                  Cetak Bukti Pendaftaran
                </h6>
                <p className="text-sm text-on-surface-variant">
                  Setelah memilih lokasi, simpan dan cetak kartu pendaftaran
                  sebagai bukti validasi kehadiran.
                </p>
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px] mr-1">
                    lock
                  </span>
                  Belum Terbuka
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification/Update Box */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 text-primary border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined">
                notifications_active
              </span>
              <span className="font-title-lg">Update Terbaru</span>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.activity_type === "ADD_LOCATION"
                            ? "bg-green-50 text-green-600"
                            : activity.activity_type === "UPDATE_LOCATION"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {activity.activity_type === "ADD_LOCATION"
                            ? "add_location"
                            : activity.activity_type === "UPDATE_LOCATION"
                            ? "edit_location"
                            : "info"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface group-hover:text-primary transition-colors font-medium">
                        {activity.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          schedule
                        </span>
                        {new Date(activity.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">
                    info
                  </span>
                  <p className="text-sm italic">
                    Belum ada informasi terbaru saat ini.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/dashboard/user/notifikasi"
                className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-primary-fixed hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                Lihat Semua Aktivitas
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">support_agent</span>
              <span className="font-title-lg">Butuh Bantuan?</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Hubungi tim helpdesk kami jika Anda mengalami kendala teknis saat
              pemilihan lokasi.
            </p>
            <button className="w-full py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-fixed transition-colors">
              Chat Admin
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
