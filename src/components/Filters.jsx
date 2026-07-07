import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Filters({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <Button variant={open ? "secondary" : "ghost"} size="sm" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>
      {open ? children : null}
    </div>
  );
}
