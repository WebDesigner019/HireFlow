import { useState } from "react";
import { ChevronDown, Database, Lightbulb, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ReasoningPanel({ reasoning, dataUsed = [], confidence, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <Card className="overflow-hidden border-blue-100 bg-blue-50/45 shadow-none">
      <button className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen((value) => !value)}>
        <span className="flex items-center gap-2 text-sm font-bold text-slate-950">
          <Lightbulb className="h-4 w-4 text-primary" />
          Explainability
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-blue-100 px-4 py-4">
          <p className="text-sm leading-6 text-slate-700">{reasoning}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Confidence
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">{Math.round(confidence * 100)}%</p>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Database className="h-3.5 w-3.5" />
                Data Used
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{dataUsed.join(", ")}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowPrompt((value) => !value)}>
            {showPrompt ? "Hide Prompt Summary" : "View Full Prompt Summary"}
          </Button>
          {showPrompt ? (
            <div className="rounded-xl bg-white p-3 text-sm leading-6 text-slate-700 ring-1 ring-blue-100">
              Prompt summary: compare parsed resume evidence against job requirements, identify matched and missing skills, apply employer memory only as a preference signal, then return recommendation, confidence, data used, and human approval status.
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
