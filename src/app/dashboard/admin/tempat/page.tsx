"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Quota {
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

export default function AdminTempatPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [editData, setEditData] = useState({
    nama_lokasi: "",
    alamat: "",
    quotaL: 0,
    quotaP: 0,
  });

  const router = useRouter();

  const fetchLocations = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLocations(response.data);
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
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

    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/dashboard/user");
      return;
    }

    setAdminName(user.nama);
    fetchLocations();
  }, [router, fetchLocations]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleEditClick = (loc: Location) => {
    setSelectedLocation(loc);
    const qL = loc.quotas?.find((q) => q.gender === "L")?.total_max || 0;
    const qP = loc.quotas?.find((q) => q.gender === "P")?.total_max || 0;
    setEditData({
      nama_lokasi: loc.nama_lokasi,
      alamat: loc.alamat,
      quotaL: qL,
      quotaP: qP,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (loc: Location) => {
    setSelectedLocation(loc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLocation) return;
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/${selectedLocation.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Lokasi berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedLocation(null);
      await fetchLocations();
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast.error(
        error.response?.data?.message ||
          "Gagal menghapus lokasi. Pastikan tidak ada data terkait."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmEdit = async () => {
    if (!selectedLocation) return;
    setIsActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locations/${selectedLocation.id}`,
        {
          nama_lokasi: editData.nama_lokasi,
          alamat: editData.alamat,
          quotas: [
            { gender: "L", total_max: editData.quotaL },
            { gender: "P", total_max: editData.quotaP },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Lokasi berhasil diperbarui");
      setIsEditModalOpen(false);
      setSelectedLocation(null);
      await fetchLocations();
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui lokasi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLocations = locations.length;
  const totalQuotaL = locations.reduce((acc, loc) => {
    const quotaL = loc.quotas?.find((q) => q.gender === "L");
    return acc + (quotaL ? quotaL.total_max : 0);
  }, 0);
  const totalQuotaP = locations.reduce((acc, loc) => {
    const quotaP = loc.quotas?.find((q) => q.gender === "P");
    return acc + (quotaP ? quotaP.total_max : 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Kelola Lokasi Seleksi
          </h1>
          <p className="text-outline font-medium mt-1">
            Pantau dan perbarui kapasitas kuota di berbagai titik lokasi.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/tambah-tempat")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 active:scale-95 sm:text-base md:w-auto md:px-6"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="truncate">Tambah Lokasi Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar - Aligned with User Selection Page */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center transition-all duration-300 hover:shadow-md">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="Cari nama lokasi atau alamat..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onClick={fetchLocations}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm sm:flex-none"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default">
          <p className="text-[11px] text-outline uppercase tracking-widest mb-3 font-bold">
            Total Lokasi
          </p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-primary">
              {totalLocations}
            </span>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined text-primary !text-2xl group-hover:text-on-primary">
                map
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default">
          <p className="text-[11px] text-outline uppercase tracking-widest mb-3 font-bold">
            Total Kuota L
          </p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-on-surface">
              {totalQuotaL}
            </span>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined text-primary !text-2xl group-hover:text-on-primary">
                male
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default">
          <p className="text-[11px] text-outline uppercase tracking-widest mb-3 font-bold">
            Total Kuota P
          </p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-on-surface">
              {totalQuotaP}
            </span>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined text-primary !text-2xl group-hover:text-on-primary">
                female
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Location Cards */}
      <div className="space-y-4 md:hidden">
        {filteredLocations.map((loc) => {
          const quotaL = loc.quotas?.find((q) => q.gender === "L");
          const quotaP = loc.quotas?.find((q) => q.gender === "P");

          return (
            <article
              key={loc.id}
              className="rounded-2xl border border-outline-variant bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface">
                    {loc.nama_lokasi}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-outline">
                    {loc.alamat}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
                  LOK-{loc.id.toString().padStart(3, "0")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-container-low p-3">
                  <p className="text-[10px] font-bold uppercase text-outline">
                    Kuota L
                  </p>
                  <p className="mt-1 text-lg font-bold text-on-surface">
                    {quotaL ? quotaL.total_max : 0}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <p className="text-[10px] font-bold uppercase text-outline">
                    Kuota P
                  </p>
                  <p className="mt-1 text-lg font-bold text-on-surface">
                    {quotaP ? quotaP.total_max : 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEditClick(loc)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
                  title="Edit Lokasi"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(loc)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-error/10 bg-error/5 px-4 py-3 text-xs font-bold text-error transition-all hover:bg-error hover:text-on-error"
                  title="Hapus Lokasi"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  Hapus
                </button>
              </div>
            </article>
          );
        })}
        {filteredLocations.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-white p-8 text-center text-sm font-bold text-outline">
            Tidak ada lokasi yang ditemukan.
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="hidden bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-left">
                <th className="py-4 px-6 text-xs text-outline font-bold uppercase tracking-wider">
                  Nama Lokasi
                </th>
                <th className="py-4 px-6 text-xs text-outline font-bold uppercase tracking-wider">
                  Alamat
                </th>
                <th className="py-4 px-6 text-xs text-outline font-bold uppercase tracking-wider text-center">
                  Kuota (L)
                </th>
                <th className="py-4 px-6 text-xs text-outline font-bold uppercase tracking-wider text-center">
                  Kuota (P)
                </th>
                <th className="py-4 px-6 text-xs text-outline font-bold uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredLocations.map((loc) => {
                const quotaL = loc.quotas?.find((q) => q.gender === "L");
                const quotaP = loc.quotas?.find((q) => q.gender === "P");
                return (
                  <tr
                    key={loc.id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-on-surface text-sm">
                        {loc.nama_lokasi}
                      </div>
                      <div className="text-[10px] text-outline mt-0.5 font-bold uppercase tracking-tight">
                        ID: LOK-{loc.id.toString().padStart(3, "0")}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-outline font-medium max-w-xs truncate">
                      {loc.alamat}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {quotaL ? quotaL.total_max : 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {quotaP ? quotaP.total_max : 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(loc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all text-xs font-bold border border-primary/10"
                          title="Edit Lokasi"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(loc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/5 text-error hover:bg-error hover:text-on-error rounded-xl transition-all text-xs font-bold border border-error/10"
                          title="Hapus Lokasi"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredLocations.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-outline font-bold"
                  >
                    Tidak ada lokasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isActionLoading && setIsEditModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md min-w-[320px] md:min-w-[448px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all flex-none">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface">Edit Lokasi</h3>
              <button
                onClick={() => !isActionLoading && setIsEditModalOpen(false)}
                className="text-outline hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
                  Nama Lokasi
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm font-medium"
                  value={editData.nama_lokasi}
                  onChange={(e) =>
                    setEditData({ ...editData, nama_lokasi: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
                  Alamat
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm font-medium h-28 resize-none"
                  value={editData.alamat}
                  onChange={(e) =>
                    setEditData({ ...editData, alamat: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
                    Kuota (L)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm font-bold"
                    value={editData.quotaL}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        quotaL: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
                    Kuota (P)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm font-bold"
                    value={editData.quotaP}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        quotaP: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container-low flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-outline hover:bg-surface-variant/20 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmEdit}
                className="px-6 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                disabled={isActionLoading}
              >
                {isActionLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isActionLoading && setIsDeleteModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 text-center sm:p-8">
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[48px]">
                  delete_forever
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-sm text-outline font-medium leading-relaxed">
                Hapus{" "}
                <span className="font-bold text-on-surface">
                  "{selectedLocation?.nama_lokasi}"
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-4 bg-surface-container-low flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-outline hover:bg-surface-variant/20 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 text-sm font-bold text-white bg-error rounded-xl hover:bg-red-700 shadow-lg shadow-error/20"
                disabled={isActionLoading}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB for Quick Addition */}
      <button
        onClick={() => router.push("/dashboard/admin/tambah-tempat")}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform hover:scale-110 active:scale-95 md:hidden"
        aria-label="Tambah Lokasi Baru"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
}
