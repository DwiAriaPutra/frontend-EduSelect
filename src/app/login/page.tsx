"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

function LoginContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (token) {
      handleLoginWithToken(token);
    }

    if (errorParam) {
      toast.error("Gagal melakukan login dengan Google");
      setError("Autentikasi Google gagal.");
    }
  }, [searchParams]);

  const handleLoginWithToken = async (token: string) => {
    setLoading(true);
    try {
      localStorage.setItem("token", token);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));

      // Check if profile is complete (for user role)
      if (user.role === "user" && (!user.nim || !user.gender || !user.jurusan)) {
        toast.success(`Selamat datang, ${user.nama}! Silakan lengkapi profil Anda.`);
        router.push("/complete-profile");
        return;
      }

      toast.success(`Selamat datang, ${user.nama}!`);

      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      toast.error("Gagal mengambil data profil");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          identifier,
          password,
        }
      );

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Token tidak diterima dari server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check if profile is complete (for user role)
      if (user.role === "user" && (!user.nim || !user.gender || !user.jurusan)) {
        toast.success(`Selamat datang kembali, ${user.nama}! Silakan lengkapi profil Anda.`);
        router.push("/complete-profile");
        return;
      }

      toast.success(`Selamat datang kembali, ${user.nama}!`);

      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat login";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login`;
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-lg md:px-xxl pt-lg">
        <Link
          className="inline-flex items-center gap-2 px-md py-sm rounded-lg text-primary hover:bg-surface-container transition-colors font-label-md text-label-md"
          href="/"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Kembali ke Beranda
        </Link>
      </div>
      <main className="flex-grow flex items-center justify-center w-full px-md py-xl">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-xl bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {/* Kolom Kiri: Kartu Biru */}
          <div className="hidden lg:block relative min-h-[600px]">
            <img
              alt="Sistem Pemilihan Tempat"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR-GOyiksYZxtKvw-N-LHYBHjXcuvxR4jpK6_mc3EMdTOego5dyuQ8efTZaZuinWcAgMTRxOz1VFBMt7AqSlHONsmPSvLPc9mSoXnkG8S1Ka_33bf2sna2K4whnnv7aVDlGPegzDgRiX73lDOgCmAGI3EuGw3mJMcKhGY-vZTsHXH_HNmS8nbKM8vhpdTtXNEtt4xFPtvo2t0VLld0mW4sLcveluW7hWo8lKGzYjmCqqrgEZZpKIHHDNxSrpkEequiGj-WSEJUoig"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent flex flex-col justify-end p-xl">
              <h2 className="font-display-md text-display-md text-white mb-sm">
                Sistem Pemilihan Tempat
              </h2>
              <p className="font-body-lg text-body-lg text-white/90">
                Akses akun Anda untuk mengelola pemilihan tempat pendidikan dan
                memantau status seleksi secara real-time.
              </p>
            </div>
          </div>
          {/* Kolom Kanan: Formulir Login */}
          <div className="p-lg md:p-xl flex flex-col justify-center">
            <div className="mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-on-background mb-unit">
                Selamat Datang
              </h1>
              <p className="font-body-md text-body-md text-secondary">
                Silakan masuk ke akun Sistem Seleksi Anda
              </p>
            </div>
            {error && (
              <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
            <form className="space-y-lg" onSubmit={handleLogin}>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-xs"
                  htmlFor="identifier"
                >
                  NIM atau Nama Lengkap
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    person
                  </span>
                  <input
                    className="w-full pl-[48px] pr-md py-sm bg-surface-bright border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-sm text-body-sm text-on-surface"
                    id="identifier"
                    name="identifier"
                    placeholder="Contoh: 20241001 atau Budi Santoso"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-xs"
                  htmlFor="password"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    lock
                  </span>
                  <input
                    className="w-full pl-[48px] pr-[48px] py-sm bg-surface-bright border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-sm text-body-sm text-on-surface"
                    id="password"
                    name="password"
                    placeholder="Masukkan kata sandi Anda"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </button>
                </div>
                <div className="flex justify-end mt-xs">
                  <Link
                    className="font-label-sm text-label-sm text-primary hover:underline"
                    href="#"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
              </div>
              <div className="pt-md">
                <button
                  className="w-full bg-primary text-white py-md rounded-lg font-title-lg text-title-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk Sekarang"}
                </button>
              </div>
            </form>
            <div className="mt-xl flex flex-col gap-md">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-md font-label-sm text-label-sm text-outline-variant">
                  atau masuk dengan
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <div className="flex flex-col items-center gap-md">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-md py-sm bg-white border border-outline-variant rounded-lg font-title-md text-title-md text-on-surface hover:bg-surface-bright active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Masuk dengan Google
                </button>
              </div>
            </div>
            <div className="mt-xl text-center">
              <p className="font-body-sm text-body-sm text-secondary">
                Belum memiliki akun?{" "}
                <Link
                  className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                  href="/register"
                >
                  Daftar Akun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-lg text-center border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant/60">
            © 2024 Sistem Pemilhan Lokasi KKN. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-lg">
            <Link
              className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-all"
              href="#"
            >
              Kebijakan Privasi
            </Link>
            <Link
              className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-all"
              href="#"
            >
              Syarat &amp; Ketentuan
            </Link>
            <Link
              className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-all"
              href="#"
            >
              Bantuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
