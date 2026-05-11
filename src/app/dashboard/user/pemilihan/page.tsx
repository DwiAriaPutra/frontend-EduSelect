"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

interface Quota {
  quota_id: number;
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

interface User {
  id: number;
  nim: string;
  nama: string;
  role: string;
  gender: string;
  jurusan: string;
}

export default function PemilihanTempat() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingLocationId, setPendingLocationId] = useState<number | null>(
    null
  );
  const [lockStatus, setLockStatus] = useState<{
    locationId: number | null;
    isLocked: boolean;
    expiresAt: string | null;
  }>({
    locationId: null,
    isLocked: false,
    expiresAt: null,
  });
  const [selectionStatus, setSelectionStatus] = useState<{
    isConfirmed: boolean;
    locationId: number | null;
  }>({
    isConfirmed: false,
    locationId: null,
  });

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const router = useRouter();

  const fetchLocations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }, []);

  const fetchUserStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/my-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { isLocked, isConfirmed, locationId, expiresAt } = response.data;

      setLockStatus({
        locationId: isLocked ? locationId : null,
        isLocked: isLocked,
        expiresAt: expiresAt || null,
      });

      setSelectionStatus({
        isConfirmed: isConfirmed,
        locationId: isConfirmed ? locationId : isLocked ? locationId : null,
      });
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      await Promise.all([fetchLocations(), fetchUserStatus()]);
      setLoading(false);
    };

    initData();
  }, [router, fetchLocations, fetchUserStatus]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token },
    });

    socket.on("quota_update", async () => {
      await Promise.all([fetchLocations(), fetchUserStatus()]);
    });

    return () => {
      socket.off("quota_update");
      socket.disconnect();
    };
  }, [fetchLocations, fetchUserStatus]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleLock = async (locationId: number) => {
    setIsProcessing(`lock-${locationId}`);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/lock`,
        { location_id: locationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLockStatus({
        locationId,
        isLocked: true,
        expiresAt: response.data.expiresAt,
      });

      toast.success(response.data.message);
      await Promise.all([fetchLocations(), fetchUserStatus()]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Gagal mengunci lokasi");
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing("confirm");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setIsConfirmModalOpen(false);
      await Promise.all([fetchLocations(), fetchUserStatus()]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Gagal konfirmasi pilihan"
        );
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async () => {
    setIsProcessing("cancel");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setLockStatus({
        locationId: null,
        isLocked: false,
        expiresAt: null,
      });
      setSelectionStatus({
        isConfirmed: false,
        locationId: null,
      });
      setIsCancelModalOpen(false);
      await Promise.all([fetchLocations(), fetchUserStatus()]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Gagal membatalkan pilihan"
        );
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSisaKuota = (loc: Location, gender: string) => {
    const quota = loc.quotas.find((q) => q.gender === gender);
    if (!quota) return 0;
    return quota.total_max - (quota.current_filled + quota.current_locked);
  };

  const getTotalSisa = (gender: string) => {
    return locations.reduce(
      (total, loc) => total + getSisaKuota(loc, gender),
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Welcome/Info Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            Pusat Seleksi Tersedia
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Silakan pilih lokasi KKN yang paling anda minati. Pastikan kuota
            masih tersedia sebelum menekan tombol pilih.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 md:w-auto">
          <span className="material-symbols-outlined text-primary">info</span>
          <span className="text-xs font-medium text-blue-700">
            Pemilihan lokasi ditutup dalam 2 hari
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center transition-all duration-300 hover:shadow-md">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="Cari Nama Lokasi atau Alamat..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex flex-1 items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors sm:flex-none">
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Filter
          </button>
          <button
            onClick={() => {
              fetchLocations();
              fetchUserStatus();
            }}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm sm:flex-none"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Bento-style Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-white rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-blue-600">
                apartment
              </span>
            </span>
          </div>
          <p className="text-sm text-blue-800 font-medium mb-1">Total Lokasi</p>
          <p className="text-2xl font-bold text-blue-900">
            {locations.length} Titik
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-white rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-emerald-600">
                man
              </span>
            </span>
          </div>
          <p className="text-sm text-emerald-800 font-medium mb-1">
            Kuota Laki-laki
          </p>
          <p className="text-2xl font-bold text-emerald-900">
            {getTotalSisa("L").toLocaleString()} Sisa
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-white rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-rose-600">
                woman
              </span>
            </span>
          </div>
          <p className="text-sm text-rose-800 font-medium mb-1">
            Kuota Perempuan
          </p>
          <p className="text-2xl font-bold text-rose-900">
            {getTotalSisa("P").toLocaleString()} Sisa
          </p>
        </div>
      </div>

      {/* Mobile Location Cards */}
      <div className="space-y-4 md:hidden">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((loc) => {
            const sisaL = getSisaKuota(loc, "L");
            const sisaP = getSisaKuota(loc, "P");
            const isCurrentLocation = selectionStatus.locationId === loc.id;
            const isLockedHere =
              lockStatus.isLocked && lockStatus.locationId === loc.id;
            const canChoose =
              !lockStatus.isLocked &&
              !selectionStatus.isConfirmed &&
              isProcessing === null &&
              getSisaKuota(loc, user?.gender || "") > 0;

            return (
              <article
                key={loc.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-on-surface">
                      {loc.nama_lokasi}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {loc.alamat}
                    </p>
                  </div>
                  {isCurrentLocation && (
                    <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600">
                      {selectionStatus.isConfirmed ? "Final" : "Terpilih"}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[11px] font-bold uppercase text-blue-700">
                      Laki-laki
                    </p>
                    <p className="mt-1 text-lg font-bold text-blue-900">
                      {sisaL > 0 ? `${sisaL} sisa` : "Penuh"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3">
                    <p className="text-[11px] font-bold uppercase text-rose-700">
                      Perempuan
                    </p>
                    <p className="mt-1 text-lg font-bold text-rose-900">
                      {sisaP > 0 ? `${sisaP} sisa` : "Penuh"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {isLockedHere && !selectionStatus.isConfirmed && (
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      disabled={isProcessing !== null}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-error/20 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                      title="Batalkan Pilihan"
                    >
                      <span className="material-symbols-outlined">cancel</span>
                    </button>
                  )}

                  {(isLockedHere ||
                    (isCurrentLocation && selectionStatus.isConfirmed)) && (
                    <button
                      onClick={() => {
                        if (!selectionStatus.isConfirmed) {
                          setPendingLocationId(loc.id);
                          setIsConfirmModalOpen(true);
                        }
                      }}
                      disabled={
                        selectionStatus.isConfirmed || isProcessing !== null
                      }
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        selectionStatus.isConfirmed
                          ? "bg-orange-50 text-orange-600"
                          : "border border-orange-200 text-orange-500 hover:bg-orange-50"
                      } disabled:opacity-50`}
                      title={
                        selectionStatus.isConfirmed
                          ? "Lokasi Terkunci"
                          : "Konfirmasi Pilihan"
                      }
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: selectionStatus.isConfirmed
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        {selectionStatus.isConfirmed ? "lock" : "lock_open"}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => handleLock(loc.id)}
                    disabled={!canChoose}
                    className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
                      canChoose
                        ? "bg-primary text-white active:scale-95"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isProcessing === `lock-${loc.id}` ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      !isCurrentLocation && (
                        <span className="material-symbols-outlined text-[20px]">
                          lock_open
                        </span>
                      )
                    )}
                    <span className="truncate">
                      {isProcessing === `lock-${loc.id}`
                        ? "Memproses..."
                        : isCurrentLocation
                        ? selectionStatus.isConfirmed
                          ? "Terkonfirmasi"
                          : "Terpilih"
                        : "Pilih Lokasi"}
                    </span>
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Tidak ada lokasi yang ditemukan.
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="hidden bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nama Lokasi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Sisa Laki-laki
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Sisa Perempuan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-on-surface">
                          {loc.nama_lokasi}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <span className="text-sm text-slate-600 line-clamp-2">
                        {loc.alamat}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-sm ${
                          getSisaKuota(loc, "L") > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {getSisaKuota(loc, "L") > 0
                          ? getSisaKuota(loc, "L")
                          : "Penuh"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-sm ${
                          getSisaKuota(loc, "P") > 0
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {getSisaKuota(loc, "P") > 0
                          ? getSisaKuota(loc, "P")
                          : "Penuh"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {/* Tombol Batalkan muncul jika sedang memilih (isLocked) tapi belum konfirmasi */}
                        {lockStatus.isLocked &&
                          lockStatus.locationId === loc.id &&
                          !selectionStatus.isConfirmed && (
                            <button
                              onClick={() => setIsCancelModalOpen(true)}
                              disabled={isProcessing !== null}
                              className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-50"
                              title="Batalkan Pilihan"
                            >
                              <span className="material-symbols-outlined">
                                cancel
                              </span>
                            </button>
                          )}

                        {/* Tombol Kunci muncul jika lokasi ini dipilih/dikunci sementara */}
                        {((lockStatus.locationId === loc.id &&
                          lockStatus.isLocked) ||
                          (selectionStatus.locationId === loc.id &&
                            selectionStatus.isConfirmed)) && (
                          <button
                            onClick={() => {
                              if (!selectionStatus.isConfirmed) {
                                setPendingLocationId(loc.id);
                                setIsConfirmModalOpen(true);
                              }
                            }}
                            disabled={
                              selectionStatus.isConfirmed ||
                              isProcessing !== null
                            }
                            className={`p-2 rounded-lg transition-all ${
                              selectionStatus.isConfirmed
                                ? "text-orange-600 bg-orange-50 cursor-default"
                                : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
                            } disabled:opacity-50`}
                            title={
                              selectionStatus.isConfirmed
                                ? "Lokasi Terkunci"
                                : "Konfirmasi Pilihan"
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontVariationSettings:
                                  selectionStatus.isConfirmed
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                              }}
                            >
                              {selectionStatus.isConfirmed
                                ? "lock"
                                : "lock_open"}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => handleLock(loc.id)}
                          disabled={
                            lockStatus.isLocked ||
                            selectionStatus.isConfirmed ||
                            isProcessing !== null ||
                            getSisaKuota(loc, user?.gender || "") <= 0
                          }
                          className={`px-5 py-2 font-medium rounded-lg transition-all shadow-sm ${
                            lockStatus.isLocked ||
                            selectionStatus.isConfirmed ||
                            isProcessing !== null ||
                            getSisaKuota(loc, user?.gender || "") <= 0
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-primary text-white hover:bg-blue-700 active:scale-95"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isProcessing === `lock-${loc.id}` ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              selectionStatus.locationId !== loc.id && (
                                <span className="material-symbols-outlined text-[20px]">
                                  lock_open
                                </span>
                              )
                            )}
                            <span>
                              {isProcessing === `lock-${loc.id}`
                                ? "Memproses..."
                                : selectionStatus.locationId === loc.id
                                ? selectionStatus.isConfirmed
                                  ? "Terkonfirmasi"
                                  : "Terpilih"
                                : "Pilih"}
                            </span>
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Tidak ada lokasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Placeholder */}
        <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="text-sm text-slate-500">
            Menampilkan {filteredLocations.length} lokasi
          </span>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg text-sm font-bold">
              1
            </button>
            <button
              className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary text-white p-6 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
          <h4 className="text-lg font-bold mb-4">Informasi Penting</h4>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-200">
                check_circle
              </span>
              <p className="text-sm">
                Lokasi yang sudah &apos;Dikunci&apos; tidak dapat diubah oleh
                orang lain.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-200">
                schedule
              </span>
              <p className="text-sm">
                Batas waktu pemilihan adalah pukul 23:59 WIB pada hari
                penutupan.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-200">
                warning
              </span>
              <p className="text-sm">
                Jika kuota habis, lokasi akan otomatis hilang dari daftar
                pemilihan.
              </p>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default">
          <h4 className="text-lg font-bold text-on-surface mb-4">Bantuan</h4>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500">
                support_agent
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Pusat Bantuan</p>
              <p className="text-xs text-slate-500">
                Tersedia 24/7 untuk kendala teknis
              </p>
            </div>
          </div>
          <button className="w-full py-3 border border-primary text-primary font-bold rounded-lg hover:bg-blue-50 transition-colors">
            Hubungi Admin
          </button>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsConfirmModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 text-center sm:p-8">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[48px]">
                  lock
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                Konfirmasi Pilihan?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Anda akan mengonfirmasi pilihan lokasi di{" "}
                <span className="font-bold text-on-surface">
                  {
                    locations.find((l) => l.id === pendingLocationId)
                      ?.nama_lokasi
                  }
                </span>
                . Pilihan ini bersifat final dan tidak dapat diubah lagi.
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing === "confirm"}
                className="flex-1 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing === "confirm" ? "Memproses..." : "Ya, Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCancelModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 text-center sm:p-8">
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[48px]">
                  warning
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                Batalkan Pilihan?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pilihan lokasi ini? Kuota
                akan dilepaskan dan dapat diambil oleh mahasiswa lain.
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                Kembali
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing === "cancel"}
                className="flex-1 py-3 text-sm font-bold text-white bg-error rounded-xl hover:bg-red-700 shadow-lg shadow-error/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing === "cancel" ? "Memproses..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
