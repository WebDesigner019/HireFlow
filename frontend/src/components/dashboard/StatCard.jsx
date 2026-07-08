import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ title, value, detail, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-primary",
    green: "bg-green-50 text-success",
    amber: "bg-amber-50 text-warning",
    red: "bg-red-50 text-danger",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-500">
          <ArrowUpRight className="h-4 w-4 text-success" />
          {detail}
        </p>
      </Card>
    </motion.div>
  );
}
