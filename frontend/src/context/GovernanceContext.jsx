import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/api/mockApi";
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
  const [integrationStatus, setIntegrationStatus] = useState("Loading backend data");

  useEffect(() => {
    let cancelled = false;

    async function loadBackendData() {
      try {
        const backendJob = await api.createDemoJob();
        const job = {
          ...initialJobs[0],
          id: backendJob.job_id,
          job_id: backendJob.job_id,
          title: backendJob.title,
          requiredSkills: backendJob.requirements
        };

        await Promise.all([
          api.createDemoCandidate("Maya Raman\nPython FastAPI Docker PostgreSQL\n6 years experience\nMSc Computer Science"),
          api.createDemoCandidate("Sarah Lee\nPython FastAPI Docker Healthcare\n4 years experience\nBSc Software Engineering"),
          api.createDemoCandidate("Daniel Okafor\nPython AWS PostgreSQL Leadership\n8 years experience\nBEng Information Systems")
        ]);

        const [backendCandidates, backendAudit] = await Promise.all([
          api.getCandidates(job),
          api.getAudit()
        ]);

        if (!cancelled) {
          setSelectedJob(job);
          setCandidateList(backendCandidates);
          setAuditLog(backendAudit);
          setIntegrationStatus(`Connected to ${api.baseUrl}`);
        }
      } catch (error) {
        if (!cancelled) {
          setIntegrationStatus(`Using mock data: ${error.message}`);
        }
      }
    }

    loadBackendData();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateCandidateStatus = useCallback((candidateId, status) => {
    setCandidateList((list) =>
      list.map((candidate) => (candidate.candidate_id === candidateId ? { ...candidate, status } : candidate))
    );
  }, []);

  const refreshShortlist = useCallback(async (job = selectedJob) => {
    const [backendCandidates, backendAudit] = await Promise.all([
      api.getCandidates(job),
      api.getAudit()
    ]);
    setCandidateList(backendCandidates);
    setAuditLog(backendAudit);
    setIntegrationStatus(`Connected to ${api.baseUrl}`);
    return backendCandidates;
  }, [selectedJob]);

  const createJobFromInput = useCallback(async ({ title, description }) => {
    const backendJob = await api.createJob({ title, description_raw: description });
    const job = {
      ...selectedJob,
      id: backendJob.job_id,
      job_id: backendJob.job_id,
      title: backendJob.title,
      requiredSkills: backendJob.requirements
    };
    setSelectedJob(job);
    await refreshShortlist(job);
    return job;
  }, [refreshShortlist, selectedJob]);

  const createCandidateFromInput = useCallback(async ({ rawText }) => {
    const candidate = await api.createCandidate(rawText);
    await refreshShortlist();
    return candidate;
  }, [refreshShortlist]);

  const recordApproval = useCallback(
    async ({ candidate, decision }) => {
      const status = decision === "Approve" ? "Approved" : decision === "Reject" ? "Rejected" : "Needs Review";
      let backendResponse = null;
      try {
        if (decision === "Approve") {
          backendResponse = await api.approve({ candidate, job: selectedJob });
        } else if (decision === "Reject") {
          backendResponse = await api.reject({ candidate, job: selectedJob });
        }
        const backendAudit = await api.getAudit();
        setAuditLog(backendAudit);
      } catch (error) {
        setIntegrationStatus(`Backend decision failed, local state updated: ${error.message}`);
      }

      updateCandidateStatus(candidate.candidate_id, status);
      const event = makeAuditEvent({
        action: "Human Decision Recorded",
        confidence: candidate.confidence,
        dataUsed: "AI recommendation, candidate resume, role rubric",
        humanOverride: false,
        decision: `${currentUser.name} selected ${decision}`,
        input: candidate.name,
        output: status,
        reasoning: backendResponse?.scheduled_message || backendResponse?.skill_gap_feedback || `Recruiter accepted checkpoint action for AI recommendation: ${candidate.recommendation}.`,
        status: "Governance Satisfied"
      });
      if (!backendResponse) {
        setAuditLog((events) => [event, ...events]);
      }
      setLastDecision({
        type: "approval",
        candidate,
        aiRecommendation: candidate.recommendation,
        humanDecision: decision,
        difference: "Aligned",
        reason: backendResponse?.scheduled_message || backendResponse?.skill_gap_feedback || "AI recommendation accepted by human reviewer.",
        timestamp: event.timestamp,
        user: currentUser.name
      });
      return event;
    },
    [selectedJob, updateCandidateStatus]
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
      integrationStatus,
      createCandidateFromInput,
      createJobFromInput,
      refreshShortlist,
      recordApproval,
      recordOverride,
      recordSchedule
    }),
    [auditLog, candidateList, createCandidateFromInput, createJobFromInput, integrationStatus, lastDecision, recordApproval, recordOverride, recordSchedule, refreshShortlist, selectedJob]
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
