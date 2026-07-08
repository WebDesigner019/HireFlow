import { auditEvents, candidates, jobs, memory, skillInsights } from "@/data/mockData";

const delay = (payload, ms = 180) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(payload)), ms));

export const api = {
  getJobs: () => delay(jobs),
  getCandidates: () => delay(candidates),
  getCandidate: (id) => delay(candidates.find((candidate) => candidate.candidate_id === id)),
  getAudit: () => delay(auditEvents),
  getMemory: () => delay(memory),
  getSkills: () => delay(skillInsights),
  approve: (payload) => delay({ ok: true, ...payload }),
  override: (payload) => delay({ ok: true, ...payload }),
  schedule: (payload) => delay({ ok: true, status: "Draft Sent", ...payload }),
  upload: (payload) => delay({ ok: true, uploadedAt: new Date().toISOString(), ...payload })
};
