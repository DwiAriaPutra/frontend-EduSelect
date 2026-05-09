"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Activity {
  id: number;
  admin_id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

export default function AdminNotificationPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchActivities(token);
  }, [router]);

  const fetchActivities = async (token: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit yang lalu`;
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

    return past.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ADD_LOCATION":
        return {
          icon: "add_location",
          bgColor: "bg-emerald-100 text-emerald-600",
        };
      case "UPDATE_LOCATION":
        return {
          icon: "edit_location",
          bgColor: "bg-blue-100 text-blue-600",
        };
      case "PASSWORD_CHANGE":
        return {
          icon: "lock_reset",
          bgColor: "bg-rose-100 text-rose-600",
        };
      default:
        return {
          icon: "notifications",
          bgColor: "bg-slate-100 text-slate-600",
        };
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Pusat Notifikasi</h1>
          <p className="text-sm text-outline mt-1">Pantau seluruh riwayat aktivitas sistem.</p>
        </div>
        <button 
          onClick={() => {
            const token = localStorage.getItem("token");
            if (token) fetchActivities(token);
          }}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const style = getActivityIcon(activity.activity_type);
            return (
              <div 
                key={activity.id} 
                className="bg-white border border-outline-variant rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${style.bgColor}`}>
                  <span className="material-symbols-outlined">{style.icon}</span>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-on-surface mb-1">{activity.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                      {activity.activity_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-outline flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <span className="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <p className="text-outline font-medium italic">Belum ada aktivitas yang tercatat saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
