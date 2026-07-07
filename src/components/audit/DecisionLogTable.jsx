import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Download, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filters } from "@/components/Filters";
import { formatDateTime, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DecisionLogTable({ events }) {
  const [expanded, setExpanded] = useState(events[0]?.id);
  const [humanOnly, setHumanOnly] = useState(false);
  const [agent, setAgent] = useState("All");
  const [exportStatus, setExportStatus] = useState("");

  const agents = useMemo(() => ["All", ...new Set(events.map((event) => event.agent))], [events]);
  const filtered = events.filter((event) => (humanOnly ? event.humanOverride : true)).filter((event) => (agent === "All" ? true : event.agent === agent));
  const markExported = (message) => {
    setExportStatus(message);
    window.setTimeout(() => setExportStatus(""), 2800);
  };
  const exportJson = () => {
    downloadFile("hireflow-audit-log.json", JSON.stringify(filtered, null, 2), "application/json");
    markExported("JSON export downloaded.");
  };
  const exportCsv = () => {
    const headers = ["Timestamp", "Agent", "Action", "Confidence", "Data Used", "Human Override", "Decision", "Status"];
    const rows = filtered.map((event) => [
      event.timestamp,
      event.agent,
      event.action,
      formatPercent(event.confidence),
      event.dataUsed,
      event.humanOverride ? "Yes" : "No",
      event.decision,
      event.status
    ]);
    downloadFile("hireflow-audit-log.csv", [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n"), "text/csv");
    markExported("CSV export downloaded.");
  };
  const exportPdf = () => {
    markExported("Print dialog opened. Choose Save as PDF.");
    window.setTimeout(() => window.print(), 50);
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <Filters>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" value={agent} onChange={(event) => setAgent(event.target.value)}>
            {agents.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" defaultValue="all">
            <option value="all">All confidence</option>
            <option value="high">High confidence</option>
            <option value="low">Low confidence</option>
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" type="date" />
          <label className="flex items-center gap-2 px-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={humanOnly} onChange={(event) => setHumanOnly(event.target.checked)} />
            Human Only
          </label>
        </Filters>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportJson}><FileJson className="h-4 w-4" />Export JSON</Button>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="h-4 w-4" />Export PDF</Button>
          <Button size="sm" onClick={exportCsv}><Download className="h-4 w-4" />Export</Button>
        </div>
        {exportStatus ? <p className="text-sm font-semibold text-success">{exportStatus}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Data Used</th>
              <th className="px-4 py-3">Human Override</th>
              <th className="px-4 py-3">Decision</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((event) => (
              <Fragment key={event.id}>
                <tr className="bg-white align-top transition hover:bg-blue-50/35">
                  <td className="px-4 py-4 font-medium text-slate-700">{formatDateTime(event.timestamp)}</td>
                  <td className="px-4 py-4 font-bold text-slate-950">{event.agent}</td>
                  <td className="px-4 py-4 text-slate-700">{event.action}</td>
                  <td className="px-4 py-4 font-bold text-slate-950">{formatPercent(event.confidence)}</td>
                  <td className="px-4 py-4 text-slate-600">{event.dataUsed}</td>
                  <td className="px-4 py-4"><Badge variant={event.humanOverride ? "violet" : "slate"}>{event.humanOverride ? "Yes" : "No"}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{event.decision}</td>
                  <td className="px-4 py-4">
                    <Button variant="ghost" size="icon" onClick={() => setExpanded(expanded === event.id ? null : event.id)} aria-label="Expand row">
                      <ChevronDown className={cn("h-4 w-4 transition", expanded === event.id && "rotate-180")} />
                    </Button>
                  </td>
                </tr>
                {expanded === event.id ? (
                  <tr>
                    <td colSpan="8" className="bg-slate-50 px-4 py-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <Detail label="Input" value={event.input} />
                        <Detail label="Output" value={event.output} />
                        <Detail label="Prompt Summary" value={event.promptSummary} />
                        <Detail label="Reasoning" value={event.reasoning} />
                        <Detail label="Confidence" value={formatPercent(event.confidence)} />
                        <Detail label="Latency" value={event.latency} />
                        <Detail label="Status" value={event.status} />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{value}</p>
    </div>
  );
}
