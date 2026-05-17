import { apiFetch } from "@/lib/api";
import { Users, BookOpen, GraduationCap } from "lucide-react";

interface Stats {
  users: { total: number; byRole: Record<string, number> };
  courses: { total: number; published: number; drafts: number };
  enrollments: { total: number };
}

async function getStats(): Promise<Stats> {
  const res = await apiFetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default async function AdminDashboard() {
  let stats: Stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <div className="text-red-500 text-sm">Failed to load dashboard stats.</div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats.users.total,
      sub: `${stats.users.byRole.STUDENT ?? 0} students, ${stats.users.byRole.INSTRUCTOR ?? 0} instructors`,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      label: "Courses",
      value: stats.courses.total,
      sub: `${stats.courses.published} published, ${stats.courses.drafts} drafts`,
      icon: BookOpen,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
    {
      label: "Enrollments",
      value: stats.enrollments.total,
      sub: "Total student enrollments",
      icon: GraduationCap,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Dashboard</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Platform overview &amp; statistics
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-zinc-200 rounded-xl p-6"
            >
              <div className={`p-3 rounded-lg w-fit ${card.bg} ${card.color} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold text-zinc-800">
                {card.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{card.label}</div>
              <div className="text-xs text-zinc-400 mt-1">{card.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
