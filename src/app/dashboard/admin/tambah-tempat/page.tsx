"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminTambahTempatPage() {
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_lokasi: "",
    alamat: "",
    kuota_lk: "",
    kuota_pr: "",
  });

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
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const payload = {
        nama_lokasi: formData.nama_lokasi,
        alamat: formData.alamat,
        quotas: [
          { gender: "L", total_max: parseInt(formData.kuota_lk) || 0 },
          { gender: "P", total_max: parseInt(formData.kuota_pr) || 0 },
        ],
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Lokasi berhasil ditambahkan!");

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/admin/tempat");
      }, 1500);
    } catch (error: any) {
      console.error("Error adding location:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
        return;
      }
      toast.error(
        error.response?.data?.message ||
          "Gagal menambahkan lokasi. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="p-4 md:p-8">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-primary rounded-2xl p-6 md:p-10 min-h-[160px] md:min-h-[220px] flex items-center mb-10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-lg shadow-primary/20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
        <div className="relative z-10 w-full max-w-2xl text-on-primary">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Registrasi Lokasi Baru
          </h2>
          <p className="text-sm md:text-lg opacity-90 leading-relaxed font-medium">
            Lengkapi formulir di bawah ini untuk menambahkan titik lokasi KKN
            baru bagi para mahasiswa.
          </p>
        </div>
        <div className="absolute right-8 bottom-4 opacity-10 pointer-events-none hidden md:block">
          <span className="material-symbols-outlined !text-[160px] select-none rotate-12">
            add_business
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-outline-variant p-6 md:p-10 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-10 text-primary border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined">description</span>
                <h3 className="text-xl font-bold text-on-surface">
                  Informasi Dasar
                </h3>
              </div>
              <div className="space-y-8">
                <div className="group">
                  <label
                    className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors"
                    htmlFor="nama_lokasi"
                  >
                    Nama Lokasi
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50 bg-surface-container-low font-medium"
                    id="nama_lokasi"
                    placeholder="Contoh: Gedung Serbaguna Utama"
                    type="text"
                    required
                    disabled={loading}
                    value={formData.nama_lokasi}
                    onChange={handleChange}
                  />
                </div>
                <div className="group">
                  <label
                    className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors"
                    htmlFor="alamat"
                  >
                    Alamat Lengkap
                  </label>
                  <textarea
                    className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50 bg-surface-container-low font-medium resize-none"
                    id="alamat"
                    placeholder="Tuliskan alamat lengkap beserta koordinat atau patokan..."
                    rows={4}
                    required
                    disabled={loading}
                    value={formData.alamat}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-outline-variant p-6 md:p-10 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-10 text-primary border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined">groups</span>
                <h3 className="text-xl font-bold text-on-surface">
                  Kapasitas & Kuota
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label
                    className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors"
                    htmlFor="kuota_lk"
                  >
                    Kuota Laki-laki
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/50 group-focus-within:text-primary transition-colors">
                      male
                    </span>
                    <input
                      className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-outline-variant/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-surface-container-low font-bold"
                      id="kuota_lk"
                      placeholder="0"
                      type="number"
                      required
                      min="0"
                      disabled={loading}
                      value={formData.kuota_lk}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-outline font-bold uppercase tracking-tight">
                    Jumlah maksimum siswa putra
                  </p>
                </div>
                <div className="group">
                  <label
                    className="block text-[11px] font-bold text-outline uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors"
                    htmlFor="kuota_pr"
                  >
                    Kuota Perempuan
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/50 group-focus-within:text-primary transition-colors">
                      female
                    </span>
                    <input
                      className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-outline-variant/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-surface-container-low font-bold"
                      id="kuota_pr"
                      placeholder="0"
                      type="number"
                      required
                      min="0"
                      disabled={loading}
                      value={formData.kuota_pr}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-outline font-bold uppercase tracking-tight">
                    Jumlah maksimum siswa putri
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Side Helper Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-outline-variant p-5 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 sticky top-24 sm:p-8">
              <h4 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-6">
                Aksi Formulir
              </h4>
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">
                        save
                      </span>
                      Simpan Lokasi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => router.push("/dashboard/admin/tempat")}
                  className="w-full bg-surface-container-low text-outline border border-outline-variant/50 py-4 rounded-xl font-bold hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                  Batal
                </button>
              </div>
              <div className="mt-10 pt-8 border-t border-outline-variant/30">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      info
                    </span>
                  </div>
                  <p className="text-xs text-outline font-medium leading-relaxed">
                    Pastikan data yang Anda masukkan sudah benar. Lokasi yang
                    disimpan akan langsung tersedia dalam portal pemilihan bagi
                    mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Meta */}
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a
      className="text-[11px] font-bold uppercase tracking-tight hover:text-primary transition-colors"
      href="#"
    >
      {label}
    </a>
  );
}
