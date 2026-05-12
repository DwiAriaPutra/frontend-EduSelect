"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const DEFAULT_JURUSAN = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Teknik Sipil",
  "Teknik Elektro",
];

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [jurusanOptions, setJurusanOptions] = useState(DEFAULT_JURUSAN);
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jurusan`
        );
        const jurusanData = response.data?.jurusan;
        const options = Array.isArray(jurusanData)
          ? jurusanData
          : Object.values(jurusanData || {});

        if (options.length > 0) {
          setJurusanOptions(options as string[]);
        }
      } catch (err) {
        console.error("Error fetching jurusan:", err);
      }
    };

    fetchJurusan();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        nama,
        nim,
        jurusan,
        gender,
        password,
      });

      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat registrasi";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-lg md:px-xxl pt-lg">
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-md py-sm rounded-lg text-primary hover:bg-surface-container transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Beranda
          </button>
        </Link>
      </div>
      <main className="flex-grow flex items-center justify-center w-full px-md py-xl">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-xl bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="hidden lg:block relative min-h-[600px]">
            <img
              alt="Edukasi Modern"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR-GOyiksYZxtKvw-N-LHYBHjXcuvxR4jpK6_mc3EMdTOego5dyuQ8efTZaZuinWcAgMTRxOz1VFBMt7AqSlHONsmPSvLPc9mSoXnkG8S1Ka_33bf2sna2K4whnnv7aVDlGPegzDgRiX73lDOgCmAGI3EuGw3mJMcKhGY-vZTsHXH_HNmS8nbKM8vhpdTtXNEtt4xFPtvo2t0VLld0mW4sLcveluW7hWo8lKGzYjmCqqrgEZZpKIHHDNxSrpkEequiGj-WSEJUoig"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex flex-col justify-end p-xl">
              <h2 className="font-display-md text-display-md text-white mb-sm">
                Sistem Pemilihan Tempat
              </h2>
              <p className="font-body-lg text-body-lg text-white/90">
                Temukan dan tentukan lokasi pendidikan terbaik yang sesuai
                dengan minat dan potensi Anda.
              </p>
            </div>
          </div>
          <div className="p-lg md:p-xl flex flex-col justify-center">
            <div className="mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-on-background mb-unit">
                Pendaftaran Akun
              </h1>
              <p className="font-body-md text-body-md text-secondary">
                Silakan lengkapi data diri Anda untuk memulai pendaftaran.
              </p>
            </div>

            {error && (
              <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleRegister}>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="full_name"
                >
                  Nama Lengkap
                </label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md"
                  id="full_name"
                  name="full_name"
                  placeholder="Contoh: Budi Santoso"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="nim"
                >
                  NIM / Nomor Induk Siswa
                </label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md"
                  id="nim"
                  name="nim"
                  placeholder="Masukkan nomor induk"
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="password"
                >
                  Kata Sandi
                </label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md"
                  id="password"
                  name="password"
                  placeholder="Masukkan kata sandi Anda"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="major"
                >
                  Jurusan
                </label>
                <div className="relative">
                  <select
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md appearance-none"
                    id="major"
                    name="major"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Pilih Jurusan
                    </option>
                    {jurusanOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="space-y-unit">
                <label className="font-label-md text-label-md text-on-surface-variant block">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-md">
                  <label
                    className={`relative flex items-center justify-center gap-2 p-md border rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors group ${
                      gender === "L"
                        ? "border-primary bg-primary-container/10"
                        : "border-outline-variant"
                    }`}
                  >
                    <input
                      className="sr-only"
                      name="gender"
                      type="radio"
                      value="L"
                      checked={gender === "L"}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    />
                    <span
                      className={`material-symbols-outlined ${
                        gender === "L" ? "text-primary" : "text-outline"
                      }`}
                    >
                      male
                    </span>
                    <span
                      className={`font-body-md text-body-md ${
                        gender === "L" ? "text-primary font-semibold" : ""
                      }`}
                    >
                      Laki-laki
                    </span>
                  </label>
                  <label
                    className={`relative flex items-center justify-center gap-2 p-md border rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors group ${
                      gender === "P"
                        ? "border-primary bg-primary-container/10"
                        : "border-outline-variant"
                    }`}
                  >
                    <input
                      className="sr-only"
                      name="gender"
                      type="radio"
                      value="P"
                      checked={gender === "P"}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    />
                    <span
                      className={`material-symbols-outlined ${
                        gender === "P" ? "text-primary" : "text-outline"
                      }`}
                    >
                      female
                    </span>
                    <span
                      className={`font-body-md text-body-md ${
                        gender === "P" ? "text-primary font-semibold" : ""
                      }`}
                    >
                      Perempuan
                    </span>
                  </label>
                </div>
              </div>
              <div className="pt-md">
                <button
                  className="w-full bg-primary text-on-primary py-md rounded-lg font-title-lg text-title-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                </button>
              </div>
            </form>
            <div className="mt-xl text-center">
              <p className="font-body-sm text-body-sm text-secondary">
                Sudah memiliki akun?{" "}
                <Link
                  className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                  href="/login"
                >
                  Masuk ke Akun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-lg text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">
          © 2026 Sistem Pemilihan Lokasi KKN. Kejelasan di Atas Segalanya.
        </p>
      </footer>
    </div>
  );
}
