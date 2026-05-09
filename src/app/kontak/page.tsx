"use client";

import Link from "next/link";
import { useState } from "react";

export default function Kontak() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Pesan Anda telah dikirim! Kami akan menghubungi Anda segera.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: "mail",
      title: "Email",
      value: "siliwangi@student.unsil.ac.id",
      description: "Balasan dalam 24 jam kerja",
    },
    {
      icon: "call",
      title: "Telepon",
      value: "+62 8953-3627-0887",
      description: "Senin - Jumat, 08:00 - 16:00",
    },
    {
      icon: "location_on",
      title: "Kantor",
      value: "Universitas Siliwangi",
      description: "Universitas Contoh, Indonesia",
    },
  ];

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
              className="font-sans text-sm font-medium tracking-tight text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
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
              className="font-sans text-sm font-semibold tracking-tight text-primary border-b-2 border-primary pb-1"
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
        <section className="py-xxl px-6 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto text-center">
            <h1 className="font-display-lg text-on-surface mb-md">
              Hubungi Kami
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Ada pertanyaan atau mengalami kendala? Tim dukungan kami siap
              membantu Anda kapan saja.
            </p>
          </div>
        </section>

        <section className="py-xxl px-6">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* Contact Form */}
            <div className="bg-white p-lg md:p-xl rounded-xxl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="font-headline-md text-on-surface mb-lg">
                Kirim Pesan
              </h2>
              <form onSubmit={handleSubmit} className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-1">
                      Nama Lengkap
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-md py-3 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-md py-3 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="alamat@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant ml-1">
                    Subjek
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-md py-3 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Apa yang ingin Anda tanyakan?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant ml-1">
                    Pesan
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-md py-3 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Tuliskan pesan Anda secara detail..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md hover:bg-primary-container transition-all shadow-md active:scale-[0.98]"
                >
                  Kirim Sekarang
                </button>
              </form>
            </div>

            {/* Contact Info & Map Placeholder */}
            <div className="space-y-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-md">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md group hover:bg-white hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                      <span className="material-symbols-outlined text-primary">
                        {info.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-title-lg text-on-surface">
                        {info.title}
                      </h4>
                      <p className="font-body-md text-primary font-semibold">
                        {info.value}
                      </p>
                      <p className="font-label-sm text-on-surface-variant mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-surface-container h-[300px] rounded-xxl border border-outline-variant relative overflow-hidden flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group cursor-pointer shadow-sm hover:shadow-md">
                <div className="absolute inset-0 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i13!2i4096!3i4096!2m3!1e0!2sm!3i345013117!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0')] bg-cover"></div>
                <div className="relative z-10 bg-white/90 backdrop-blur px-lg py-md rounded-full shadow-lg border border-outline-variant flex items-center gap-sm transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-error">
                    location_on
                  </span>
                  <span className="font-label-md text-on-surface">
                    Lihat di Google Maps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Note */}
        <section className="py-xxl px-6 bg-surface-container-low">
          <div className="max-w-3xl mx-auto text-center space-y-md">
            <h2 className="font-headline-lg text-on-surface">
              Pertanyaan Umum (FAQ)
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Mungkin jawaban yang Anda cari sudah ada di halaman panduan kami.
            </p>
            <Link
              href="/panduan"
              className="inline-flex items-center gap-sm text-primary font-label-md hover:underline"
            >
              Buka Halaman Panduan
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 w-full">
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
              Syarat & Ketentuan
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
