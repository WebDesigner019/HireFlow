import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MinusCircle, ShieldQuestion, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MatchScore } from "@/components/MatchScore";
import { ReasoningPanel } from "@/components/ReasoningPanel";
import { SkillTag } from "@/components/SkillTag";
import { useGovernance } from "@/context/GovernanceContext";

export function CandidateDrawer({ candidate, open, onClose }) {
  const { recordApproval } = useGovernance();
  const navigate = useNavigate();
  if (!candidate) return null;

  const decide = (decision) => {
    recordApproval({ candidate, decision });
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Candidate Summary</p>
                <h2 className="text-xl font-bold text-slate-950">{candidate.name}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{candidate.photo}</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-950">{candidate.experience} - {candidate.current_company}</p>
                  <p className="text-sm text-slate-500">{candidate.education} - {candidate.location}</p>
                </div>
                <MatchScore value={candidate.match_score} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI Recommendation</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{candidate.recommendation}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approval Status</p>
                  <div className="mt-2"><Badge variant="blue">{candidate.status}</Badge></div>
                </div>
              </div>

              <section>
                <h3 className="mb-2 text-sm font-bold text-slate-950">Resume Highlights</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {candidate.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-xl bg-slate-50 px-3 py-2">{highlight}</li>
                  ))}
                </ul>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-950">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matched_skills.map((skill) => <SkillTag key={skill} tone="green">{skill}</SkillTag>)}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-950">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill) => <SkillTag key={skill} tone="red">{skill}</SkillTag>)}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-950">Pros</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {candidate.pros.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-950">Cons</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {candidate.cons.map((item) => <li key={item} className="flex gap-2"><MinusCircle className="mt-0.5 h-4 w-4 text-warning" />{item}</li>)}
                  </ul>
                </div>
              </section>

              <ReasoningPanel defaultOpen reasoning={candidate.reasoning} dataUsed={candidate.data_used} confidence={candidate.confidence} />
              <ConfidenceBadge value={candidate.confidence} />

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 sm:grid-cols-4">
                <Button variant="success" onClick={() => decide("Approve")}><CheckCircle2 className="h-4 w-4" />Approve</Button>
                <Button variant="danger" onClick={() => decide("Reject")}><XCircle className="h-4 w-4" />Reject</Button>
                <Button variant="warning" onClick={() => decide("Needs Review")}><ShieldQuestion className="h-4 w-4" />Review</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate("/approval", { state: { candidateId: candidate.candidate_id } });
                  }}
                >
                  Override
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
