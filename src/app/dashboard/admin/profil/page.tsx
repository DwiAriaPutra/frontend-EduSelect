"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Activity {
  id: number;
  admin_id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

export default function AdminProfilPage() {
  const [adminName, setAdminName] = useState("Admin");
  const [adminId, setAdminId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Asumsikan ID kepegawaian disimpan di field 'id' atau menggunakan dummy jika tidak ada
    setAdminId(user.id || "198801012023");

    fetchActivities(token);
  }, [router]);

  const fetchActivities = async (token: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivities(response.data);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit yang lalu`;
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

    return past.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ADD_LOCATION":
        return {
          icon: "add_location",
          bgColor: "bg-primary/10",
          textColor: "text-primary",
        };
      case "PASSWORD_CHANGE":
        return {
          icon: "lock_reset",
          bgColor: "bg-error/10",
          textColor: "text-error",
        };
      default:
        return {
          icon: "history",
          bgColor: "bg-surface-container-high",
          textColor: "text-outline",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Hero Profile Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Profile Identity Card */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-surface-container-low bg-primary-container flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-inner">
              {adminName.charAt(0)}
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary rounded-xl text-white flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold text-on-surface tracking-tight">
                {adminName}
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                Verifikasi Aktif
              </span>
            </div>
            <p className="text-outline font-medium flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-sm">badge</span>
              ID Kepegawaian: {adminId}
            </p>
          </div>
        </div>
        {/* Stats Quick View */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-2xl p-8 flex flex-col justify-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-lg shadow-primary/20">
          <div className="mb-4">
            <span className="material-symbols-outlined text-4xl opacity-50">
              verified_user
            </span>
          </div>
          <h4 className="text-xl font-bold mb-2">Status Keamanan</h4>
          <p className="text-sm opacity-90 mb-4 font-medium">
            Akun Anda terlindungi dengan sistem keamanan terbaru.
          </p>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div className="bg-white w-[85%] h-full"></div>
          </div>
          <p className="text-[10px] mt-3 font-bold uppercase tracking-widest opacity-80">
            Skor Keamanan: 85%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Personal Information Grid */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h4 className="text-xl font-bold text-on-surface">
              Detail Informasi
            </h4>
            <button className="text-primary font-bold text-sm hover:underline">
              Edit Detail
            </button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
            <InfoItem label="Nama Lengkap" value={adminName} />
            <InfoItem label="ID Kepegawaian" value={adminId} />
            <InfoItem label="Role Akses" value="Super Administrator" />
            <InfoItem label="Email Terdaftar" value="admin@eduselect.id" />
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 text-primary border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined">history</span>
              <span className="text-lg font-bold text-on-surface">
                Aktivitas Terakhir
              </span>
            </div>

            <div className="flex-grow space-y-5 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {activities.length > 0 ? (
                activities.map((activity, index) => {
                  const style = getActivityIcon(activity.activity_type);
                  return (
                    <div key={index} className="flex gap-4 pb-1 group">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bgColor} ${style.textColor} shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {style.icon}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-on-surface font-bold leading-snug group-hover:text-primary transition-colors">
                          {activity.description}
                        </p>
                        <p className="text-[10px] text-outline mt-1.5 flex items-center gap-1.5 font-bold uppercase tracking-tight">
                          <span className="material-symbols-outlined text-[14px]">
                            schedule
                          </span>
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-outline text-center">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-20">
                    history_toggle_off
                  </span>
                  <p className="text-sm font-bold italic">
                    Belum ada aktivitas tercatat
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <button className="w-full py-3 bg-surface-container-low text-outline rounded-xl text-xs font-bold hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 border border-outline-variant/30">
                Lihat Semua Aktivitas
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Settings */}
      <div className="mt-8 bg-surface-container-low rounded-2xl p-8 border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-outline-variant/30 flex items-center justify-center text-primary shadow-sm group hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-4xl">security</span>
          </div>
          {/* Ganti baris ini */}
          <div className="flex-1 md:max-w-2xl">
            <h5 className="text-2xl font-bold text-on-surface mb-1">
              Keamanan & Akses
            </h5>
            <p className="text-sm text-outline font-medium leading-relaxed">
              Kelola kata sandi, sesi aktif, dan privasi akun Anda untuk
              memastikan data tetap aman.
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/20">
            Ganti Sandi
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-outline-variant text-on-surface rounded-xl font-bold hover:bg-surface-container hover:text-primary transition-all text-sm">
            Sesi Aktif
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8f9ff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c2c6d6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0058be;
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="font-bold text-on-surface text-sm">{value}</p>
    </div>
  );
}
