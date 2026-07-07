import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Clock, FileCheck2, Hourglass, Percent, RotateCcw, Upload, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApprovalRateChart, ApprovalTrendChart, CandidatesByMatchChart, PipelineFunnelChart } from "@/components/charts/DashboardCharts";
import { useGovernance } from "@/context/GovernanceContext";
import { formatDateTime, formatPercent } from "@/lib/utils";
import hireflowLogo from "@/assets/hireflow-logo.jpeg";

export default function Dashboard() {
  const { candidates, auditLog } = useGovernance();
  const avgConfidence = Math.round((candidates.reduce((sum, item) => sum + item.confidence, 0) / candidates.length) * 100);
  const pending = candidates.filter((candidate) => candidate.status.includes("Pending")).length;
  const overrides = auditLog.filter((event) => event.humanOverride).length;

  return (
    <>
      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <div className="flex min-h-56 items-center justify-center border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
            <img
              src={hireflowLogo}
              alt="HireFlow"
              className="h-auto max-h-40 w-full max-w-[300px] object-contain"
            />
          </div>
          <div className="flex flex-col justify-center p-6 lg:p-8">
            <Badge variant="blue" className="w-fit">Qwen Cloud Hackathon</Badge>
            <h1 className="mt-4 text-2xl font-bold text-slate-950 md:text-3xl">AI Recruiter Governance Dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Monitor candidate ranking, human approvals, overrides, explainability, and audit readiness from one enterprise workflow.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-primary ring-1 ring-blue-100">AI recommends</span>
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-success ring-1 ring-green-100">Human approves</span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100">Every decision is explainable</span>
            </div>
            <div className="mt-6">
              <QuickActions />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Candidates" value={candidates.length} detail="148 resumes parsed this week" icon={UsersRound} tone="blue" />
        <StatCard title="Candidates Reviewed" value="42" detail="24 reviewed today" icon={FileCheck2} tone="green" />
        <StatCard title="Pending Approval" value={pending} detail="Human checkpoint required" icon={Hourglass} tone="amber" />
        <StatCard title="AI Confidence Average" value={`${avgConfidence}%`} detail="Across active shortlist" icon={Percent} tone="blue" />
        <StatCard title="Human Overrides" value={overrides} detail="All reasons captured" icon={RotateCcw} tone="red" />
        <StatCard title="Time Saved" value="18h" detail="Estimated screening time" icon={Clock} tone="green" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <CandidatesByMatchChart />
        <ApprovalRateChart />
        <PipelineFunnelChart />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ApprovalTrendChart />
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLog.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950">{event.action}</p>
                  <Badge variant={event.humanOverride ? "violet" : "blue"}>{formatPercent(event.confidence)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event.decision}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{formatDateTime(event.timestamp)} - {event.agent}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["JD uploaded and parsed", "AI ranked five candidates", "Recruiter opened Sarah Lee recommendation", "Audit log synchronized"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50/55">
          <CardHeader>
            <CardTitle>Recruiter Workflow</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            {["Upload Job Description", "AI ranks candidates", "Recruiter reviews recommendations", "Override requires reason", "Audit log updates instantly", "Interview draft generated", "Employer memory shown", "Skill gap recommendation shown"].map((step, index) => (
              <div key={step} className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
                <span className="mr-2 text-primary">{index + 1}.</span>{step}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const simulateUpload = (kind) => {
    setMessage(`${kind} uploaded. AI parsing and ranking refreshed for this hiring workflow.`);
    window.setTimeout(() => setMessage(""), 3200);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => simulateUpload("Resume")}><Upload className="h-4 w-4" />Upload Resume</Button>
      <Button onClick={() => simulateUpload("Job description")}><Upload className="h-4 w-4" />Upload JD</Button>
      <Button variant="outline" onClick={() => navigate("/approval")}>Review Queue</Button>
      <Button variant="outline" onClick={() => navigate("/audit")}>View Audit</Button>
      {message ? (
        <div className="absolute right-0 top-12 z-10 w-72 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-900 shadow-soft">
          {message}
        </div>
      ) : null}
    </div>
  );
}
