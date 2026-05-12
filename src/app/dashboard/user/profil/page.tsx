"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nim: string;
  nama: string;
  role: string;
  gender: string;
  jurusan: string;
}

interface Location {
  id: number;
  nama_lokasi: string;
  alamat: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionStatus, setSelectionStatus] = useState<{
    isConfirmed: boolean;
    isLocked: boolean;
    locationId: number | null;
    locationName?: string;
  }>({
    isConfirmed: false,
    isLocked: false,
    locationId: null,
  });

  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchUserStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/my-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { isLocked, isConfirmed, locationId } = response.data;

      let locationName = "Belum Memilih";

      if (locationId) {
        const locResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/locations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const locations: Location[] = locResponse.data;
        const selectedLoc = locations.find(
          (l: Location) => l.id === locationId
        );
        if (selectedLoc) {
          locationName = selectedLoc.nama_lokasi;
        }
      }

      setSelectionStatus({
        isLocked,
        isConfirmed,
        locationId,
        locationName,
      });
    } catch (error) {
      console.error("Error fetching user status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchUserStatus();
    } catch (e) {
      console.error("Error parsing user data", e);
      router.push("/login");
    }
  }, [router, fetchUserStatus]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background text-on-background"
        style={{ colorScheme: "light" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="p-4 bg-background text-on-background min-h-full sm:p-6 lg:p-12"
      style={{ colorScheme: "light" }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 space-y-8">
          <section
            style={{
              colorScheme: "light",
              backgroundImage: "linear-gradient(to bottom, #ffffff, #ffffff)",
            }}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm sm:p-8"
          >
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-3xl border-4 border-slate-50 shadow-sm">
                {getInitials(user?.nama || "")}
              </div>
            </div>

            <div className="mt-6">
              {/* Paksa warna HEX langsung, jangan pakai variabel text-on-surface dulu */}
              <h2 className="text-2xl font-bold text-[#0b1c30]">
                {user?.nama}
              </h2>
              <p className="text-[#0058be] font-medium mt-1">{user?.nim}</p>
            </div>

            <div className="w-full mt-8 pt-8 border-t border-slate-100 flex justify-around gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Status
                </p>
                <p className="text-base font-semibold text-[#0b1c30]">Aktif</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Angkatan
                </p>
                <p className="text-base font-semibold text-[#0b1c30]">2024</p>
              </div>
            </div>
          </section>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-700">
                Data Terverifikasi
              </h3>
              <p className="text-xs text-emerald-600/80">
                Identitas Anda telah diverifikasi oleh sistem pusat.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <h3 className="text-lg font-bold text-on-surface">
                Detail Mahasiswa
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2 sm:p-6">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Nama Lengkap
                </label>
                <p className="text-base text-on-surface font-medium">
                  {user?.nama}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  NIM
                </label>
                <p className="text-base text-on-surface font-medium">
                  {user?.nim}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Jurusan
                </label>
                <p className="text-base text-on-surface font-medium">
                  {user?.jurusan}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  Jenis Kelamin
                </label>
                <p className="text-base text-on-surface font-medium">
                  {user?.gender === "L"
                    ? "Laki-laki"
                    : user?.gender === "P"
                    ? "Perempuan"
                    : "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-primary text-white rounded-2xl p-5 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] sm:p-8">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined">apartment</span>
                <h3 className="text-lg font-bold">Status Tempat Terpilih</h3>
              </div>
              <div
                className={`backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:bg-white/30 ${
                  selectionStatus.isConfirmed
                    ? "bg-white/20 border-white/30"
                    : selectionStatus.isLocked
                    ? "bg-orange-500/20 border-orange-500/30"
                    : "bg-white/10 border-white/20"
                }`}
              >
                <p className="text-xs text-white/80 font-medium">
                  {selectionStatus.isConfirmed
                    ? "Lokasi Penempatan Final:"
                    : selectionStatus.isLocked
                    ? "Lokasi Terkunci Sementara:"
                    : "Status Saat Ini:"}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h4 className="text-xl md:text-2xl font-bold">
                    {selectionStatus.locationName}
                  </h4>
                </div>
                {!selectionStatus.isConfirmed && !selectionStatus.isLocked && (
                  <Link
                    href="/dashboard/user/pemilihan"
                    className="inline-block mt-4 text-xs font-bold bg-white text-primary px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Pilih Lokasi Sekarang
                  </Link>
                )}
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </section>
        </div>
      </div>
    </div>
  );
}
