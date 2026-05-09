"use client";

import Link from "next/link";
import { useState } from "react";

export default function Panduan() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const steps = [
    {
      title: "Registrasi & Akun",
      description: "Langkah awal untuk memulai proses pemilihan lokasi.",
      icon: "person_add",
      color: "bg-primary-fixed",
      textColor: "text-primary",
      details: [
        "Siapkan NIM (Nomor Induk Mahasiswa) yang valid.",
        "Isi formulir pendaftaran dengan Nama, Password, Gender, dan Jurusan.",
        "Pastikan data yang dimasukkan sudah benar karena akan digunakan untuk validasi kuota gender.",
      ],
    },
    {
      title: "Eksplorasi Lokasi",
      description: "Cari lokasi KKN yang sesuai dengan keinginan Anda.",
      icon: "map",
      color: "bg-secondary-fixed",
      textColor: "text-secondary",
      details: [
        "Lihat daftar lokasi yang tersedia pada dashboard.",
        "Periksa alamat dan sisa kuota yang tersedia untuk gender Anda.",
        "Gunakan fitur pencarian untuk mempermudah menemukan lokasi tertentu.",
      ],
    },
    {
      title: "Sistem Penguncian (Locking)",
      description: "Mekanisme pengamanan kuota sementara agar tidak berebutan.",
      icon: "lock_clock",
      color: "bg-tertiary-fixed",
      textColor: "text-tertiary",
      details: [
        "Saat Anda memilih lokasi, sistem akan mengunci kursi tersebut selama 5 menit.",
        "Status kuota akan diperbarui secara real-time untuk pengguna lain.",
        "Jika dalam 5 menit Anda tidak melakukan konfirmasi, kunci akan dilepas otomatis.",
      ],
    },
    {
      title: "Konfirmasi Final",
      description: "Tahap akhir untuk menetapkan pilihan lokasi Anda.",
      icon: "verified",
      color: "bg-primary-container",
      textColor: "text-on-primary-container",
      details: [
        "Klik tombol konfirmasi sebelum masa penguncian berakhir.",
        "Sistem akan mencatat pilihan Anda secara permanen di database.",
        "Setelah konfirmasi, Anda tidak dapat mengubah pilihan lokasi lagi.",
      ],
    },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <nav className="w-full px-4 py-3 max-w-[1280px] mx-auto md:grid md:grid-cols-3 md:items-center md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3 md:contents">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-base font-bold text-primary tracking-tight justify-self-start sm:text-xl"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              school
            </span>
            <span className="truncate">Sistem Pemilihan Lokasi</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant text-primary transition-colors hover:bg-surface-container md:hidden"
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <div className="hidden md:flex items-center gap-8 justify-self-center">
            <Link
              className="font-sans text-sm font-medium tracking-tight text-slate-600 hover:text-primary transition-colors"
              href="/"
            >
              Beranda
            </Link>
            <Link
              className="font-sans text-sm font-semibold tracking-tight text-primary border-b-2 border-primary pb-1"
              href="/panduan"
            >
              Panduan
            </Link>
            <Link
              className="font-sans text-sm font-medium tracking-tight text-slate-600 hover:text-primary transition-colors"
              href="/kontak"
            >
              Kontak
            </Link>
          </div>
          <div className="hidden justify-self-end items-center gap-2 md:flex">
            <Link href="/login">
              <button className="text-primary hover:bg-surface-container px-3 py-2 rounded-full font-label-md text-label-md transition-all sm:px-4">
                Masuk
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all shadow-sm sm:px-6">
                Daftar
              </button>
            </Link>
          </div>
          </div>
          {isMenuOpen && (
            <div className="mt-3 rounded-2xl border border-outline-variant bg-white p-3 shadow-lg md:hidden">
              <div className="flex flex-col gap-1">
                <Link
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-surface-container hover:text-primary"
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  className="rounded-xl px-4 py-3 text-sm font-bold text-primary bg-primary/5"
                  href="/panduan"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Panduan
                </Link>
                <Link
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-surface-container hover:text-primary"
                  href="/kontak"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontak
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-outline-variant pt-3">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full rounded-xl px-4 py-3 text-sm font-bold text-primary hover:bg-surface-container">
                    Masuk
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary shadow-sm">
                    Daftar
                  </button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow">
        {/* Header Section */}
        <section className="py-xl px-4 bg-surface-container-lowest sm:px-6 md:py-xxl">
          <div className="max-w-[1280px] mx-auto text-center">
            <h1 className="font-display-lg text-on-surface mb-md">
              Panduan Penggunaan
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Ikuti langkah-langkah di bawah ini untuk memahami cara kerja
              sistem pemilihan lokasi KKN dan memastikan Anda mendapatkan kuota
              yang diinginkan.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-xl px-4 sm:px-6 md:py-xxl">
          <div className="max-w-4xl mx-auto space-y-xl">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-lg bg-white p-lg rounded-xxl border border-outline-variant hover:border-primary hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`w-16 h-16 shrink-0 rounded-xl ${step.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <span
                    className={`material-symbols-outlined ${step.textColor} text-3xl`}
                  >
                    {step.icon}
                  </span>
                </div>
                <div className="space-y-md">
                  <div>
                    <h3 className="font-headline-md text-on-surface">
                      {step.title}
                    </h3>
                    <p className="font-body-md text-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                  <ul className="space-y-sm">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-sm">
                        <span className="material-symbols-outlined text-primary text-sm mt-1">
                          check_circle
                        </span>
                        <span className="font-body-sm text-on-surface-variant">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Preview or Note */}
        <section className="py-xl px-4 bg-surface-container-low sm:px-6 md:py-xxl">
          <div className="max-w-[1280px] mx-auto bg-primary text-on-primary p-6 rounded-xxl flex flex-col md:flex-row items-center justify-between gap-lg sm:p-xxl md:gap-xl">
            <div className="space-y-sm">
              <h2 className="font-headline-lg">Masih Bingung?</h2>
              <p className="font-body-md opacity-90">
                Kami siap membantu Anda jika menemui kendala teknis atau
                memiliki pertanyaan lebih lanjut.
              </p>
            </div>
            <Link
              href="/kontak"
              className="w-full bg-white text-primary px-6 py-4 rounded-xl font-label-md hover:bg-surface-container transition-colors shrink-0 text-center sm:w-auto sm:px-xxl"
            >
              Hubungi Bantuan
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 w-full">
        <div className="w-full py-8 px-4 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-4 sm:px-6">
          <div className="font-sans text-xs text-slate-600">
            © 2026 Sistem Pemilihan Lokasi KKN. Hak Cipta Dilindungi.
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-lg">
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
