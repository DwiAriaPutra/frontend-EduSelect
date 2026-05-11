"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

interface Student {
  id: number;
  nama: string;
  nim: string | null;
  jurusan: string | null;
  gender: string | null;
  is_online: boolean;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudents(response.data);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        setError(err.response?.data?.message || "Gagal memuat daftar mahasiswa");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token },
    });

    socket.on(
      "student_status_update",
      ({ userId, is_online }: { userId: number; is_online: boolean }) => {
        setStudents((current) =>
          current.map((student) =>
            student.id === userId ? { ...student, is_online } : student
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const summary = useMemo(() => {
    const online = students.filter((student) => student.is_online).length;
    return {
      total: students.length,
      online,
      offline: students.length - online,
    };
  }, [students]);

  const getGenderLabel = (gender: string | null) => {
    if (gender === "L") return "Laki-laki";
    if (gender === "P") return "Perempuan";
    return "Belum diisi";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-3 py-5 pb-28 sm:px-6 md:px-8 md:py-8 md:pb-12">
      <div className="mb-5 flex flex-col gap-4 md:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-on-surface mb-1 sm:text-2xl">
            Daftar Mahasiswa
          </h2>
          <p className="text-sm font-medium text-outline sm:text-base">
            Pantau data mahasiswa terdaftar beserta status aktifnya.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-[420px] sm:grid-cols-3 sm:gap-3">
          <SummaryCard
            label="Total"
            value={summary.total}
            icon="groups"
            className="col-span-2 sm:col-span-1"
          />
          <SummaryCard
            label="Online"
            value={summary.online}
            icon="radio_button_checked"
            tone="online"
          />
          <SummaryCard
            label="Offline"
            value={summary.offline}
            icon="radio_button_unchecked"
            tone="offline"
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-semibold text-error">
          {error}
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-sm sm:p-10">
          <span className="material-symbols-outlined mb-3 text-5xl text-outline">
            group_off
          </span>
          <h3 className="text-lg font-bold text-on-surface">
            Belum ada mahasiswa
          </h3>
          <p className="mt-1 text-sm font-medium text-outline">
            Mahasiswa yang sudah terdaftar akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container">
                <tr className="text-xs font-bold uppercase tracking-wide text-outline">
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">NIM</th>
                  <th className="px-5 py-4">Jurusan</th>
                  <th className="px-5 py-4">Gender</th>
                  <th className="px-5 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-surface-container/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.nama} />
                        <span className="font-bold text-on-surface">
                          {student.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-on-surface-variant">
                      {student.nim || "-"}
                    </td>
                    <td className="px-5 py-4 font-medium text-on-surface-variant">
                      {student.jurusan || "Belum diisi"}
                    </td>
                    <td className="px-5 py-4 font-medium text-on-surface-variant">
                      {getGenderLabel(student.gender)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <StatusBadge isOnline={student.is_online} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={student.nama} />
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold leading-snug text-on-surface">
                        {student.nama}
                      </h3>
                      <p className="mt-0.5 break-words text-sm font-medium text-outline">
                        {student.nim || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:justify-end">
                    <StatusBadge isOnline={student.is_online} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <InfoBlock
                    label="Jurusan"
                    value={student.jurusan || "Belum diisi"}
                  />
                  <InfoBlock
                    label="Gender"
                    value={getGenderLabel(student.gender)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "default" | "online" | "offline";
  className?: string;
}) {
  const toneClass =
    tone === "online"
      ? "text-green-700 bg-green-100"
      : tone === "offline"
      ? "text-slate-600 bg-slate-100"
      : "text-primary bg-primary/10";

  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm ${className}`}
    >
      <div
        className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}
      >
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <p className="text-lg font-black leading-none text-on-surface sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-outline sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-black text-on-primary-container ring-2 ring-white">
      {initials || "M"}
    </div>
  );
}

function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
        isOnline
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-slate-400"
        }`}
      ></span>
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-container p-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-outline">
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-on-surface">
        {value}
      </p>
    </div>
  );
}
