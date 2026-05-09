"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Link from "next/link";

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

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    socket.on("quota_update", () => {
      fetchLocations();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const calculateTotalRemaining = (quotas: Quota[] | undefined) => {
    if (!quotas) return 0;
    return quotas.reduce((acc, q) => {
      const remaining = q.total_max - (q.current_filled + q.current_locked);
      return acc + (remaining > 0 ? remaining : 0);
    }, 0);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <nav className="grid grid-cols-3 items-center w-full px-6 py-4 max-w-[1280px] mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary dark:text-white tracking-tight justify-self-start"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              school
            </span>
            <span>Sistem Pemilihan Lokasi</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 justify-self-center">
            <Link
              className="font-sans text-sm font-semibold tracking-tight text-primary border-b-2 border-primary pb-1"
              href="/"
            >
              Beranda
            </Link>
            <Link
              className="font-sans text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              href="/panduan"
            >
              Panduan
            </Link>
            <Link
              className="font-sans text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              href="/kontak"
            >
              Kontak
            </Link>
          </div>
          <div className="justify-self-end flex items-center gap-2">
            <Link href="/login">
              <button className="text-primary hover:bg-surface-container px-4 py-2 rounded-full font-label-md text-label-md transition-all">
                Masuk
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all shadow-sm">
                Daftar
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="beranda" className="relative py-xxl px-6 overflow-hidden">
          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="max-w-3xl space-y-lg">
              <h1 className="font-display-lg text-on-surface tracking-tight">
                Tentukan Lokasi KKN Terbaik Anda
              </h1>
              <p className="font-body-lg text-on-surface-variant">
                Platform pemilihan lokasi KKN yang transparan, akuntabel, dan
                mudah digunakan untuk membantu Anda memilih lokasi terbaik yang
                anda inginkan.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
                <Link href="/register">
                  <button className="bg-primary text-on-primary px-xxl py-4 rounded-xl font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm active:scale-95">
                    Mulai Sekarang
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Process Section */}
        <section id="panduan" className="py-xxl bg-surface-container-low px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-xxl">
              <h2 className="font-headline-lg text-on-surface">
                Proses Pemilihan Lokasi Sederhana
              </h2>
              <p className="font-body-md text-on-surface-variant mt-sm">
                Tiga langkah mudah untuk mengamankan kursi lokasi KKN anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Step 1 */}
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center text-center group hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-lg transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    search
                  </span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">Pilih</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Cari dan tentukan lokasi KKN yang sesuai dengan minat dan
                  domisili Anda dari daftar yang tersedia.
                </p>
              </div>
              {/* Step 2 */}
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center text-center group hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-lg transition-transform group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-tertiary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">Kunci</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Amankan pilihan Anda sebelum kuota penuh. Sistem kami
                  memastikan keadilan dalam alokasi waktu nyata.
                </p>
              </div>
              {/* Step 3 */}
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center text-center group hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center mb-lg transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    verified
                  </span>
                </div>
                <h3 className="font-title-lg text-on-surface mb-sm">
                  Konfirmasi
                </h3>
                <p className="font-body-sm text-on-surface-variant">
                  Konfirmasi lokasi pilihan anda sebelum kuota lokasi tersebut
                  habis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Table Section */}
        <section className="py-xxl px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-lg gap-md">
              <div>
                <h2 className="font-headline-lg text-on-surface">
                  Preview Lokasi
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Daftar lokasi pendidikan dengan kuota terbaru yang tersedia.
                </p>
              </div>
              <div className="flex items-center gap-sm text-primary font-label-md text-label-md cursor-pointer hover:underline">
                Lihat Semua Lokasi
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant">
                      Lokasi
                    </th>
                    <th className="px-lg py-4 font-label-md text-on-surface-variant text-center">
                      Kuota Tersisa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-lg py-8 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-4 h-4 bg-primary animate-bounce rounded-full"></div>
                          <div className="w-4 h-4 bg-primary animate-bounce rounded-full [animation-delay:-.3s]"></div>
                          <div className="w-4 h-4 bg-primary animate-bounce rounded-full [animation-delay:-.5s]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : locations.length > 0 ? (
                    locations.map((loc) => {
                      const remaining = calculateTotalRemaining(loc.quotas);
                      return (
                        <tr
                          key={loc.id}
                          className="hover:bg-surface-container transition-colors cursor-default"
                        >
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-primary">
                                  school
                                </span>
                              </div>
                              <div>
                                <div className="font-body-md font-semibold text-on-surface">
                                  {loc.nama_lokasi}
                                </div>
                                <div className="text-label-sm text-on-surface-variant">
                                  {loc.alamat}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md text-center">
                            <span
                              className={`px-md py-1 rounded-full text-label-sm transition-all ${
                                remaining > 10
                                  ? "bg-tertiary-container text-on-tertiary-container hover:brightness-110"
                                  : "bg-error-container text-on-error-container hover:brightness-110"
                              }`}
                            >
                              {remaining} Kursi
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-lg py-8 text-center text-on-surface-variant"
                      >
                        Tidak ada lokasi yang tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="kontak" className="py-xxl bg-surface-container-low px-6">
          <div className="max-w-[1280px] mx-auto text-center">
            <h2 className="font-headline-lg text-on-surface mb-md">
              Hubungi Kami
            </h2>
            <p className="font-body-md text-on-surface-variant mb-lg max-w-2xl mx-auto">
              Memiliki pertanyaan seputar pemilihan lokasi KKN? Tim kami siap
              membantu Anda mendapatkan informasi yang dibutuhkan.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-lg mt-xl">
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center w-full md:w-64 hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-default group">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center mb-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    mail
                  </span>
                </div>
                <h4 className="font-title-lg text-on-surface mb-xs">Email</h4>
                <p className="font-body-sm text-on-surface-variant">
                  siliwangi@student.unsil.ac.id
                </p>
              </div>
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center w-full md:w-64 hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-default group">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center mb-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    call
                  </span>
                </div>
                <h4 className="font-title-lg text-on-surface mb-xs">Telepon</h4>
                <p className="font-body-sm text-on-surface-variant">
                  +62 8953-3627-0887
                </p>
              </div>
              <div className="bg-white p-lg rounded-xl border border-outline-variant flex flex-col items-center w-full md:w-64 hover:border-primary hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-default group">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center mb-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    location_on
                  </span>
                </div>
                <h4 className="font-title-lg text-on-surface mb-xs">Kantor</h4>
                <p className="font-body-sm text-on-surface-variant">
                  Universitas Siliwangi
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 w-full mt-xxl">
        <div className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-4">
          <div className="font-sans text-xs text-slate-600 dark:text-slate-400">
            © 2026 Sistem Pemilihan Lokasi KKN. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-lg">
            <a
              className="font-sans text-xs text-slate-500 hover:text-blue-700 transition-all"
              href="#"
            >
              Kebijakan Privasi
            </a>
            <a
              className="font-sans text-xs text-slate-500 hover:text-blue-700 transition-all"
              href="#"
            >
              Syarat &amp; Ketentuan
            </a>
            <a
              className="font-sans text-xs text-slate-500 hover:text-blue-700 transition-all"
              href="#"
            >
              Bantuan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
