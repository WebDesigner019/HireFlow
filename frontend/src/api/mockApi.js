import { auditEvents, candidates as fallbackCandidates, jobs as fallbackJobs, memory, skillInsights } from "@/data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const delay = (payload, ms = 120) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(payload)), ms));

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`HireFlow API ${response.status}: ${detail}`);
  }

  return response.json();
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "HF";
}

function splitReasoning(reasoning) {
  const missingMatch = reasoning.match(/missing:\s*(.*)$/i);
  const missing = missingMatch?.[1]
    ?.split(",")
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== "none") || [];
  return { missing };
}

function mapShortlistCandidate(candidate, rank, selectedJob) {
  const { missing } = splitReasoning(candidate.reasoning);
  const matchPercent = Math.round(candidate.match_score * 100);
  const requiredSkills = selectedJob?.requiredSkills || [];
  const missingSet = new Set(missing.map((skill) => skill.toLowerCase()));
  const matchedSkills = requiredSkills.filter((skill) => !missingSet.has(skill.toLowerCase()));

  return {
    candidate_id: candidate.candidate_id,
    name: candidate.name,
    rank,
    photo: initials(candidate.name),
    match_score: matchPercent,
    confidence: candidate.match_score,
    status: "Pending Approval",
    experience: "Experience parsed",
    current_company: "Profile intake",
    location: "Not specified",
    education: "See candidate profile",
    skills: matchedSkills.length ? [...new Set([...matchedSkills, ...missing])] : requiredSkills,
    missing_skills: missing,
    matched_skills: matchedSkills,
    reasoning: candidate.reasoning,
    pros: matchedSkills.length ? [`Matched ${matchedSkills.join(", ")}`] : ["Relevant profile signals found"],
    cons: missing.length ? missing.map((skill) => `Missing ${skill}`) : ["No major stated skill gaps"],
    recommendation: matchPercent >= 75 ? "Approve Candidate" : matchPercent >= 55 ? "Needs Review" : "Reject Candidate",
    data_used: ["Parsed candidate profile", "Parsed job requirements", "HireFlow matching score"],
    highlights: [
      `Ranked #${rank} for ${selectedJob?.title || "selected role"}`,
      `Match score ${matchPercent}%`,
      candidate.reasoning
    ]
  };
}

function mapDecisionLog(entry) {
  return {
    id: `${entry.timestamp}-${entry.agent_name}-${entry.decision}`,
    timestamp: entry.timestamp,
    agent: entry.agent_name,
    action: entry.decision,
    confidence: entry.confidence,
    dataUsed: entry.input_summary,
    humanOverride: entry.human_override,
    decision: entry.decision,
    input: entry.input_summary,
    output: entry.decision,
    promptSummary: "Backend decision log entry recorded by HireFlow.",
    reasoning: entry.input_summary,
    latency: "Logged",
    status: entry.human_override ? "Human checkpoint" : "Completed"
  };
}

export const api = {
  baseUrl: API_BASE_URL,

  getJobs: () => delay(fallbackJobs),

  getCandidates: async (job) => {
    try {
      const shortlist = await request(`/jobs/${job.job_id || job.id}/shortlist`);
      return shortlist.candidates.map((candidate, index) => mapShortlistCandidate(candidate, index + 1, job));
    } catch {
      return delay(fallbackCandidates);
    }
  },

  getAudit: async () => {
    try {
      const payload = await request("/decisions/log");
      return payload.log.map(mapDecisionLog).reverse();
    } catch {
      return delay(auditEvents);
    }
  },

  getMemory: () => delay(memory),
  getSkills: () => delay(skillInsights),

  createJob: ({ title, description_raw }) =>
    request("/jobs", {
      method: "POST",
      body: JSON.stringify({ title, description_raw })
    }),

  createCandidate: (rawText) => {
    const formData = new FormData();
    formData.append("raw_text", rawText);
    return request("/candidates", {
      method: "POST",
      body: formData
    });
  },

  createDemoJob: () =>
    request("/jobs", {
      method: "POST",
      body: JSON.stringify({
        title: "Senior Backend Engineer",
        description_raw: "Python FastAPI Docker AWS PostgreSQL 5+ years experience"
      })
    }),

  createDemoCandidate: (rawText) => api.createCandidate(rawText),

  approve: ({ candidate, job }) =>
    request(`/decisions/${candidate.candidate_id}/approve`, {
      method: "POST",
      body: JSON.stringify({ job_id: job.job_id || job.id })
    }),

  reject: ({ candidate, job }) =>
    request(`/decisions/${candidate.candidate_id}/reject`, {
      method: "POST",
      body: JSON.stringify({ job_id: job.job_id || job.id })
    }),

  override: (payload) => delay({ ok: true, ...payload }),
  schedule: (payload) => delay({ ok: true, status: "Draft Ready", ...payload }),
  upload: (payload) => delay({ ok: true, uploadedAt: new Date().toISOString(), ...payload })
};
