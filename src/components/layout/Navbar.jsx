import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BriefcaseBusiness, ChevronDown, Menu, Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGovernance } from "@/context/GovernanceContext";
import { sidebarItems } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { currentUser, jobs, selectedJob, setSelectedJob } = useGovernance();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1540px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="max-w-xl pl-9" placeholder="Search candidates, decisions, audit events..." />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <select
                className="max-w-56 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                value={selectedJob.id}
                onChange={(event) => setSelectedJob(jobs.find((job) => job.id === event.target.value))}
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" onClick={() => setNotificationsOpen((value) => !value)} aria-expanded={notificationsOpen}>
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
            </Button>
            <AnimatePresence>
              {notificationsOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-12 z-30 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-soft"
                >
                  <p className="mb-2 text-sm font-bold text-slate-950">Notifications</p>
                  {["3 candidates awaiting approval", "Sarah Lee override reason required before submission", "Audit trail export is ready for review"].map((item) => (
                    <div key={item} className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 [&+&]:mt-2">
                      {item}
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-4 text-slate-950">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/75 px-4 py-2 lg:hidden">
          <Badge variant="blue">HireFlow - AI governance platform</Badge>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] bg-white p-4 shadow-2xl lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">HireFlow</p>
                    <p className="text-xs text-slate-500">Recruiter Autopilot</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                          isActive ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-100"
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
