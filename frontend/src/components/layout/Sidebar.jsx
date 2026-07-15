import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BrainCircuit,
  CalendarClock,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  Settings,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";

export const sidebarItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Candidates", path: "/candidates", icon: UsersRound },
  { label: "Approval Queue", path: "/approval", icon: ClipboardCheck },
  { label: "Audit Log", path: "/audit", icon: FileClock },
  { label: "Interview Scheduling", path: "/scheduling", icon: CalendarClock },
  { label: "Employer Memory", path: "/memory", icon: BrainCircuit },
  { label: "Skill Gap Insights", path: "/skills", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift">
          <img src="/favicon.jpeg" alt="HireFlow logo" className="h-full w-full scale-150 object-cover" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-950">HireFlow</p>
          <p className="text-xs font-medium text-slate-500">Recruiter Autopilot</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-primary shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Governance Rule</p>
        <p className="mt-2 text-sm font-semibold text-slate-950">AI recommends. Human approves.</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">Every recommendation carries confidence, reasoning, data used, and approval status.</p>
      </div>
    </aside>
  );
}
