import { motion } from "framer-motion";
import { Bot, CheckCircle2, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPercent } from "@/lib/utils";

export function AuditTimeline({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {events.slice(0, 7).map((event, index) => {
          const Icon = event.humanOverride || event.agent.includes("Human") ? UserCheck : event.status.includes("Completed") ? CheckCircle2 : Bot;
          return (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="relative flex gap-4 pb-6 last:pb-0">
              {index !== events.slice(0, 7).length - 1 ? <span className="absolute left-5 top-10 h-full w-px bg-slate-200" /> : null}
              <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary ring-1 ring-blue-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-950">{event.action}</p>
                  <Badge variant={event.humanOverride ? "violet" : "blue"}>{formatPercent(event.confidence)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event.decision}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{formatDateTime(event.timestamp)} - {event.agent}</p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
