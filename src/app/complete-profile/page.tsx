"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CompleteProfilePage() {
  const [nim, setNim] = useState("");
  const [gender, setGender] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (!token || !userJson) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      // If profile is already complete, redirect to dashboard
      if (user.nim && user.gender && user.jurusan) {
        if (user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/complete-profile`,
        { nim, gender, jurusan },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { user, token: newToken, message } = response.data;
      if (newToken) {
        localStorage.setItem("token", newToken);
      }
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(message || "Profil berhasil dilengkapi!");

      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal melengkapi profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-lg md:px-xxl pt-lg">
        <Link
          className="inline-flex items-center gap-2 px-md py-sm rounded-lg text-primary hover:bg-surface-container transition-colors font-label-md text-label-md"
          href="/login"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Kembali ke Login
        </Link>
      </div>
      <main className="flex-grow flex items-center justify-center w-full px-md py-xl">
        {/* Tambahkan flex-none dan min-w untuk mengunci lebar modal agar tidak gepeng */}
        <div className="w-full max-w-xl min-w-[320px] md:min-w-[500px] flex-none bg-surface-container-lowest rounded-xl border border-outline-variant p-lg md:p-xl shadow-sm">
          <div className="mb-xl text-center">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-unit">
              Lengkapi Profil Anda
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Silakan lengkapi data berikut untuk melanjutkan ke sistem
            </p>
          </div>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            {/* NIM */}
            <div className="space-y-unit">
              <label
                className="font-label-md text-label-md text-on-surface-variant block ml-xs"
                htmlFor="nim"
              >
                NIM
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  badge
                </span>
                <input
                  className="w-full pl-[48px] pr-md py-sm bg-surface-bright border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-sm text-body-sm text-on-surface"
                  id="nim"
                  name="nim"
                  placeholder="Masukkan NIM Anda"
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Jurusan */}
            <div className="space-y-unit">
              <label
                className="font-label-md text-label-md text-on-surface-variant block ml-xs"
                htmlFor="jurusan"
              >
                Jurusan
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  school
                </span>
                <input
                  className="w-full pl-[48px] pr-md py-sm bg-surface-bright border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-sm text-body-sm text-on-surface"
                  id="jurusan"
                  name="jurusan"
                  placeholder="Contoh: Teknik Informatika"
                  type="text"
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-unit">
              <label className="font-label-md text-label-md text-on-surface-variant block ml-xs">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-2 gap-md">
                <button
                  type="button"
                  onClick={() => setGender("L")}
                  className={`flex items-center justify-center gap-2 py-sm rounded-lg border transition-all ${
                    gender === "L"
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-surface-bright border-outline-variant text-on-surface-variant hover:border-outline"
                  }`}
                >
                  <span className="material-symbols-outlined">male</span>
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender("P")}
                  className={`flex items-center justify-center gap-2 py-sm rounded-lg border transition-all ${
                    gender === "P"
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-surface-bright border-outline-variant text-on-surface-variant hover:border-outline"
                  }`}
                >
                  <span className="material-symbols-outlined">female</span>
                  Perempuan
                </button>
              </div>
            </div>

            <div className="pt-md">
              <button
                className="w-full bg-primary text-white py-md rounded-lg font-title-lg text-title-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || !nim || !gender || !jurusan}
              >
                {loading ? "Menyimpan..." : "Simpan dan Lanjutkan"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer className="w-full py-lg text-center border-t border-slate-200 mt-auto">
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">
          © 2024 Sistem Pemilhan Lokasi KKN. Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}
