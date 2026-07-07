import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { auditEvents as initialAuditEvents, candidates as initialCandidates, jobs as initialJobs } from "@/data/mockData";
import { nowIso } from "@/lib/utils";

const GovernanceContext = createContext(null);

const currentUser = {
  name: "Aisha Rahman",
  role: "Lead Recruiter",
  avatar: "AR"
};

function makeAuditEvent({ agent = "HumanApprovalAgent", action, confidence, dataUsed, humanOverride, decision, input, output, reasoning, status }) {
  return {
    id: `a-${crypto.randomUUID()}`,
    timestamp: nowIso(),
    agent,
    action,
    confidence,
    dataUsed,
    humanOverride,
    decision,
    input,
    output,
    promptSummary: "Human-in-the-loop governance checkpoint recorded the final decision and explanation.",
    reasoning,
    latency: "Human checkpoint",
    status
  };
}

export function GovernanceProvider({ children }) {
  const [selectedJob, setSelectedJob] = useState(initialJobs[0]);
  const [candidateList, setCandidateList] = useState(initialCandidates);
  const [auditLog, setAuditLog] = useState(initialAuditEvents);
  const [lastDecision, setLastDecision] = useState(null);

  const updateCandidateStatus = useCallback((candidateId, status) => {
    setCandidateList((list) =>
      list.map((candidate) => (candidate.candidate_id === candidateId ? { ...candidate, status } : candidate))
    );
  }, []);

  const recordApproval = useCallback(
    ({ candidate, decision }) => {
      const status = decision === "Approve" ? "Approved" : decision === "Reject" ? "Rejected" : "Needs Review";
      updateCandidateStatus(candidate.candidate_id, status);
      const event = makeAuditEvent({
        action: "Human Decision Recorded",
        confidence: candidate.confidence,
        dataUsed: "AI recommendation, candidate resume, role rubric",
        humanOverride: false,
        decision: `${currentUser.name} selected ${decision}`,
        input: candidate.name,
        output: status,
        reasoning: `Recruiter accepted checkpoint action for AI recommendation: ${candidate.recommendation}.`,
        status: "Governance Satisfied"
      });
      setAuditLog((events) => [event, ...events]);
      setLastDecision({
        type: "approval",
        candidate,
        aiRecommendation: candidate.recommendation,
        humanDecision: decision,
        difference: "Aligned",
        reason: "AI recommendation accepted by human reviewer.",
        timestamp: event.timestamp,
        user: currentUser.name
      });
      return event;
    },
    [updateCandidateStatus]
  );

  const recordOverride = useCallback(
    ({ candidate, decision, reason }) => {
      updateCandidateStatus(candidate.candidate_id, `Override: ${decision}`);
      const event = makeAuditEvent({
        action: "Human Override Logged",
        confidence: candidate.confidence,
        dataUsed: "AI recommendation, candidate resume, recruiter override reason",
        humanOverride: true,
        decision: `${currentUser.name} overrode AI to ${decision}`,
        input: candidate.name,
        output: reason,
        reasoning: reason,
        status: "Policy Satisfied"
      });
      setAuditLog((events) => [event, ...events]);
      setLastDecision({
        type: "override",
        candidate,
        aiRecommendation: candidate.recommendation,
        humanDecision: decision,
        difference: "Overridden",
        reason,
        timestamp: event.timestamp,
        user: currentUser.name
      });
      return event;
    },
    [updateCandidateStatus]
  );

  const recordSchedule = useCallback(({ candidate, interviewTime }) => {
    const event = makeAuditEvent({
      agent: "SchedulingAgent",
      action: "Generated Interview Draft",
      confidence: 0.88,
      dataUsed: "Candidate profile, recruiter availability, selected role",
      humanOverride: false,
      decision: `Interview draft prepared for ${candidate.name}`,
      input: `${candidate.name} for ${selectedJob.title}`,
      output: interviewTime,
      reasoning: "Draft created after human-reviewed shortlist action.",
      status: "Draft Ready"
    });
    setAuditLog((events) => [event, ...events]);
    return event;
  }, [selectedJob.title]);

  const value = useMemo(
    () => ({
      currentUser,
      jobs: initialJobs,
      selectedJob,
      setSelectedJob,
      candidates: candidateList,
      auditLog,
      lastDecision,
      recordApproval,
      recordOverride,
      recordSchedule
    }),
    [auditLog, candidateList, lastDecision, recordApproval, recordOverride, recordSchedule, selectedJob]
  );

  return <GovernanceContext.Provider value={value}>{children}</GovernanceContext.Provider>;
}

export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (!context) {
    throw new Error("useGovernance must be used within GovernanceProvider");
  }
  return context;
}
