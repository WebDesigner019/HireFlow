import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { CheckCircle2, ClipboardCheck, History, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MatchScore } from "@/components/MatchScore";
import { SkillTag } from "@/components/SkillTag";
import { ReasoningPanel } from "@/components/ReasoningPanel";
import { formatDateTime } from "@/lib/utils";
import { useGovernance } from "@/context/GovernanceContext";

export function ApprovalCard({ candidate }) {
  const { currentUser, lastDecision, recordApproval, recordOverride } = useGovernance();
  const [mode, setMode] = useState("idle");
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues: { reason: "" } });
  const reason = watch("reason");

  const timeline = useMemo(() => {
    const base = [
      { label: "AI Recommendation Created", icon: Sparkles },
      { label: "Human Checkpoint Opened", icon: ClipboardCheck }
    ];
    if (success) {
      base.push({ label: "Decision Recorded", icon: CheckCircle2 });
      base.push({ label: "Human Override Logged", icon: History });
      base.push({ label: "Governance Policy Satisfied", icon: ShieldCheck });
    }
    return base;
  }, [success]);

  const submitApproval = (decision) => {
    recordApproval({ candidate, decision });
    setMode(decision);
    setSuccess(true);
  };

  const submitOverride = ({ reason: overrideReason }) => {
    recordOverride({ candidate, decision: "Reject", reason: overrideReason });
    setMode("Override");
    setSuccess(true);
    reset();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">AI Recommendation</p>
              <CardTitle className="mt-1 text-2xl">{candidate.recommendation}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <MatchScore value={candidate.match_score} size="lg" />
              <ConfidenceBadge value={candidate.confidence} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{candidate.photo}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{candidate.name}</h2>
              <p className="text-sm text-slate-500">{candidate.experience} at {candidate.current_company} - {candidate.location}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-3 text-sm font-bold text-green-900">Matched</p>
              <div className="flex flex-wrap gap-2">
                {candidate.matched_skills.map((skill) => <SkillTag key={skill} tone="green">{skill}</SkillTag>)}
              </div>
            </section>
            <section className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="mb-3 text-sm font-bold text-red-900">Missing</p>
              <div className="flex flex-wrap gap-2">
                {candidate.missing_skills.map((skill) => <SkillTag key={skill} tone="red">{skill}</SkillTag>)}
              </div>
            </section>
          </div>

          <ReasoningPanel defaultOpen reasoning={candidate.reasoning} dataUsed={candidate.data_used} confidence={candidate.confidence} />

          <section className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-bold text-slate-950">Human Decision</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="success" onClick={() => submitApproval("Approve")}><CheckCircle2 className="h-4 w-4" />Approve</Button>
              <Button variant="danger" onClick={() => submitApproval("Reject")}><XCircle className="h-4 w-4" />Reject</Button>
              <Button variant={mode === "overrideForm" ? "secondary" : "outline"} onClick={() => setMode("overrideForm")}>Override Recommendation</Button>
            </div>

            {mode === "overrideForm" ? (
              <form className="mt-4 space-y-3" onSubmit={handleSubmit(submitOverride)}>
                <Textarea
                  placeholder="Explain why you are overriding the AI recommendation..."
                  {...register("reason", { required: "Override reason is required.", minLength: { value: 12, message: "Please add enough context for the audit trail." } })}
                />
                {errors.reason ? <p className="text-sm font-semibold text-danger">{errors.reason.message}</p> : null}
                <Button type="submit" disabled={!reason || reason.trim().length < 12}>Submit Override</Button>
              </form>
            ) : null}
          </section>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-green-950">Governance checkpoint complete</p>
                  <p className="text-sm text-green-700">Decision recorded, audit log updated, and policy requirements satisfied.</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Decision Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Evidence label="AI Recommendation" value={candidate.recommendation} />
            <Evidence label="Human Decision" value={lastDecision?.candidate?.candidate_id === candidate.candidate_id ? lastDecision.humanDecision : "Awaiting decision"} />
            <Evidence label="Difference" value={lastDecision?.candidate?.candidate_id === candidate.candidate_id ? lastDecision.difference : "Not yet evaluated"} />
            <Evidence label="Override Reason" value={lastDecision?.type === "override" ? lastDecision.reason : "No override submitted"} />
            <Evidence label="Timestamp" value={lastDecision?.candidate?.candidate_id === candidate.candidate_id ? formatDateTime(lastDecision.timestamp) : "Pending"} />
            <Evidence label="User" value={currentUser.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governance Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-primary ring-1 ring-blue-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <Badge variant={index < 2 || success ? "green" : "slate"}>{index < 2 || success ? "Complete" : "Pending"}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Evidence({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
