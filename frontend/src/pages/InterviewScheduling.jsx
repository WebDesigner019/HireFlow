import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Eye, MailCheck, Pencil, RefreshCw, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGovernance } from "@/context/GovernanceContext";

export default function InterviewScheduling() {
  const { candidates, selectedJob, currentUser, recordSchedule } = useGovernance();
  const candidate = candidates[0];
  const textareaRef = useRef(null);
  const [draft, setDraft] = useState(`Hi ${candidate.name},

Thanks for your interest in the ${selectedJob.title} role. We were impressed by your backend platform experience and would like to invite you to a technical interview.

Proposed time: July 10, 2026 at 10:30 AM.

The interview will focus on Python, FastAPI service design, Docker deployment patterns, and production decision-making.

Best,
${currentUser.name}`);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState(false);

  const sendDraft = () => {
    recordSchedule({ candidate, interviewTime: "July 10, 2026 10:30 AM" });
    setSent(true);
  };
  const regenerateDraft = () => {
    setDraft(`Hi ${candidate.name},

Thanks for speaking with us about the ${selectedJob.title} role. HireFlow identified a strong match across backend APIs, Docker delivery, and production ownership, and our recruiter has reviewed the recommendation.

Could you join a technical interview on July 10, 2026 at 10:30 AM?

We will cover FastAPI architecture, service reliability, and practical trade-offs from your recent work.

Best,
${currentUser.name}`);
    setSent(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Interview Scheduling"
        title="AI-Generated Interview Draft"
        description="Review, edit, regenerate, preview, and send a recruiter-approved interview invitation from the governed hiring workflow."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
            <CardTitle>Editable Invitation</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => textareaRef.current?.focus()}><Pencil className="h-4 w-4" />Edit</Button>
              <Button variant="outline" size="sm" onClick={regenerateDraft}><RefreshCw className="h-4 w-4" />Regenerate</Button>
              <Button variant={preview ? "secondary" : "outline"} size="sm" onClick={() => setPreview((value) => !value)}><Eye className="h-4 w-4" />Preview</Button>
              <Button size="sm" onClick={sendDraft}><Send className="h-4 w-4" />Send</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <Textarea ref={textareaRef} className="min-h-[360px] leading-6" value={draft} onChange={(event) => setDraft(event.target.value)} />
            {preview ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-950">Preview</p>
                <div className="whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-slate-700 ring-1 ring-blue-100">{draft}</div>
              </div>
            ) : null}
            {sent ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <MailCheck className="h-6 w-6 text-success" />
                <div>
                  <p className="font-bold text-green-950">Invitation ready for delivery</p>
                  <p className="text-sm text-green-700">SchedulingAgent action was added to the audit trail.</p>
                </div>
              </motion.div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info label="Candidate" value={candidate.name} />
            <Info label="Role" value={selectedJob.title} />
            <Info label="Interview Time" value="July 10, 2026 - 10:30 AM" />
            <Info label="Recruiter" value={currentUser.name} />
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
              <div className="mt-2"><Badge variant={sent ? "green" : "amber"}>{sent ? "Draft Sent" : "Draft Ready"}</Badge></div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <CalendarClock className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Human-reviewed shortlist decisions can trigger scheduling drafts while preserving the approval trail.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
