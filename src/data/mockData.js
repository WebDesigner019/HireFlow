export const jobs = [
  {
    id: "job-ml-platform",
    title: "Senior Backend Engineer",
    department: "AI Platform",
    location: "Remote",
    requiredSkills: ["Python", "FastAPI", "Docker", "AWS", "PostgreSQL"]
  },
  {
    id: "job-product-ai",
    title: "AI Product Manager",
    department: "Product",
    location: "Singapore",
    requiredSkills: ["Roadmapping", "Analytics", "LLM Evaluation", "Stakeholder Management"]
  },
  {
    id: "job-data-eng",
    title: "Data Engineer",
    department: "Data",
    location: "Kuala Lumpur",
    requiredSkills: ["Python", "Airflow", "BigQuery", "CI/CD"]
  }
];

export const candidates = [
  {
    candidate_id: "c121",
    name: "Maya Raman",
    rank: 1,
    photo: "MR",
    match_score: 94,
    confidence: 0.91,
    status: "Pending Approval",
    experience: "6 years",
    current_company: "Stripe",
    location: "Singapore",
    education: "MSc Computer Science",
    skills: ["Python", "FastAPI", "Docker", "PostgreSQL", "Fintech"],
    missing_skills: ["AWS Certification"],
    matched_skills: ["Python", "FastAPI", "Docker", "PostgreSQL"],
    reasoning: "Matched 4 of 5 required skills. Deep API ownership and fintech risk systems experience increased ranking. Missing AWS certification.",
    pros: ["Strong backend architecture", "Fintech domain fit", "Led API reliability improvements"],
    cons: ["No current AWS certification", "Limited formal people management"],
    recommendation: "Approve Candidate",
    data_used: ["Parsed resume", "JD requirements", "GitHub portfolio", "Previous override memory"],
    highlights: ["Reduced payment API latency by 38%", "Owned FastAPI services serving 12M monthly requests", "Mentored three engineers on observability"],
    decision_log: [
      {
        timestamp: "2026-07-07T09:12:00+08:00",
        agent: "MatchingAgent",
        action: "Ranked Candidate",
        confidence: 0.91
      }
    ]
  },
  {
    candidate_id: "c123",
    name: "Sarah Lee",
    rank: 2,
    photo: "SL",
    match_score: 92,
    confidence: 0.87,
    status: "Pending Review",
    experience: "4 years",
    current_company: "Grab",
    location: "Kuala Lumpur",
    education: "BSc Software Engineering",
    skills: ["Python", "FastAPI", "Docker", "Healthcare"],
    missing_skills: ["AWS Certification"],
    matched_skills: ["Python", "FastAPI", "Docker", "Healthcare experience"],
    reasoning: "Matched 4 of 5 required skills. Strong backend experience. Missing AWS certification. Previous healthcare platform work increases ranking.",
    pros: ["Clear FastAPI delivery record", "Healthcare data privacy exposure", "High recruiter preference fit"],
    cons: ["Missing AWS certification", "Less experience than top-ranked candidate"],
    recommendation: "Approve Candidate",
    data_used: ["Parsed resume", "JD requirements", "Employer memory", "Recruiter override history"],
    highlights: ["Built HIPAA-aligned appointment APIs", "Containerized legacy services with Docker", "Wrote patient matching rules with audit logs"],
    decision_log: [
      {
        timestamp: "2026-07-07T12:30:00+08:00",
        agent: "MatchingAgent",
        action: "Ranked Candidate",
        confidence: 0.87
      }
    ]
  },
  {
    candidate_id: "c127",
    name: "Daniel Okafor",
    rank: 3,
    photo: "DO",
    match_score: 84,
    confidence: 0.79,
    status: "Needs Review",
    experience: "8 years",
    current_company: "Wise",
    location: "London",
    education: "BEng Information Systems",
    skills: ["Python", "AWS", "Leadership", "PostgreSQL"],
    missing_skills: ["FastAPI", "Docker"],
    matched_skills: ["Python", "AWS", "PostgreSQL"],
    reasoning: "Strong seniority and AWS experience, but direct FastAPI and Docker evidence is weaker than shortlisted peers.",
    pros: ["Experienced technical lead", "Production AWS depth", "Strong financial systems background"],
    cons: ["Limited FastAPI examples", "Docker experience not explicit"],
    recommendation: "Needs Review",
    data_used: ["Parsed resume", "JD requirements", "LinkedIn summary"],
    highlights: ["Led migration to AWS ECS", "Owned PostgreSQL performance tuning", "Managed six-engineer squad"],
    decision_log: [
      {
        timestamp: "2026-07-07T13:05:00+08:00",
        agent: "MatchingAgent",
        action: "Flagged for Review",
        confidence: 0.79
      }
    ]
  },
  {
    candidate_id: "c130",
    name: "Priya Nair",
    rank: 4,
    photo: "PN",
    match_score: 76,
    confidence: 0.74,
    status: "Pending Review",
    experience: "3 years",
    current_company: "Doctor Anywhere",
    location: "Bengaluru",
    education: "BTech Computer Science",
    skills: ["Python", "Docker", "CI/CD", "Healthcare"],
    missing_skills: ["FastAPI", "AWS", "System Design"],
    matched_skills: ["Python", "Docker", "Healthcare experience"],
    reasoning: "Promising healthcare background and Docker usage, but missing FastAPI, AWS, and system design evidence for the senior role.",
    pros: ["Healthcare domain signal", "Strong learning trajectory", "CI/CD exposure"],
    cons: ["Shorter experience", "Senior system design not demonstrated"],
    recommendation: "Reject Candidate",
    data_used: ["Parsed resume", "JD requirements", "Skill gap model"],
    highlights: ["Built integration tests for clinical workflows", "Shipped Dockerized internal tools", "Improved deployment reliability"],
    decision_log: [
      {
        timestamp: "2026-07-07T13:25:00+08:00",
        agent: "MatchingAgent",
        action: "Recommended Reject",
        confidence: 0.74
      }
    ]
  },
  {
    candidate_id: "c132",
    name: "Alex Chen",
    rank: 5,
    photo: "AC",
    match_score: 69,
    confidence: 0.68,
    status: "Pending Review",
    experience: "5 years",
    current_company: "ShopBack",
    location: "Taipei",
    education: "BSc Mathematics",
    skills: ["Node.js", "React", "PostgreSQL", "Analytics"],
    missing_skills: ["Python", "FastAPI", "Docker", "AWS"],
    matched_skills: ["PostgreSQL"],
    reasoning: "Strong product engineering profile, but core backend stack alignment is low for this job description.",
    pros: ["Excellent product sense", "Strong analytics background", "Good database experience"],
    cons: ["Limited Python evidence", "No FastAPI or Docker signals"],
    recommendation: "Reject Candidate",
    data_used: ["Parsed resume", "JD requirements"],
    highlights: ["Built merchant analytics dashboards", "Improved checkout conversion by 11%", "Worked with PostgreSQL-heavy services"],
    decision_log: [
      {
        timestamp: "2026-07-07T13:40:00+08:00",
        agent: "MatchingAgent",
        action: "Recommended Reject",
        confidence: 0.68
      }
    ]
  }
];

export const auditEvents = [
  {
    id: "a-1001",
    timestamp: "2026-07-07T09:10:00+08:00",
    agent: "JobParserAgent",
    action: "Parsed Job Description",
    confidence: 0.95,
    dataUsed: "JD upload, role rubric",
    humanOverride: false,
    decision: "Requirements extracted",
    input: "Senior Backend Engineer job description",
    output: "Python, FastAPI, Docker, AWS, PostgreSQL",
    promptSummary: "Extract hard skills, soft preferences, seniority and must-have criteria.",
    reasoning: "Identified stack keywords and seniority markers from the job description.",
    latency: "420ms",
    status: "Completed"
  },
  {
    id: "a-1002",
    timestamp: "2026-07-07T09:12:00+08:00",
    agent: "MatchingAgent",
    action: "Ranked Candidate",
    confidence: 0.91,
    dataUsed: "Resume, JD, employer memory",
    humanOverride: false,
    decision: "Maya Raman ranked #1",
    input: "Candidate profile c121",
    output: "Match score 94%",
    promptSummary: "Score candidate against role requirements and recruiter preferences.",
    reasoning: "High hard-skill overlap plus fintech signal aligned with employer preference.",
    latency: "710ms",
    status: "Awaiting Approval"
  },
  {
    id: "a-1003",
    timestamp: "2026-07-07T12:30:00+08:00",
    agent: "MatchingAgent",
    action: "Ranked Candidate",
    confidence: 0.87,
    dataUsed: "Resume, JD, previous decisions",
    humanOverride: false,
    decision: "Sarah Lee ranked #2",
    input: "Candidate profile c123",
    output: "Match score 92%",
    promptSummary: "Rank candidate and produce explainable recommendation.",
    reasoning: "Matched 4 of 5 required skills and healthcare experience boosted ranking.",
    latency: "650ms",
    status: "Awaiting Approval"
  },
  {
    id: "a-1004",
    timestamp: "2026-07-07T13:48:00+08:00",
    agent: "MemoryAgent",
    action: "Updated Employer Memory",
    confidence: 0.82,
    dataUsed: "Historical override reasons",
    humanOverride: false,
    decision: "Practical experience weighted above certificates",
    input: "Prior recruiter decisions",
    output: "Preference: practical experience over certifications",
    promptSummary: "Summarize stable recruiter preferences from human decisions.",
    reasoning: "Multiple overrides favored practical production experience despite missing certification.",
    latency: "530ms",
    status: "Completed"
  }
];

export const memory = {
  preferences: ["Communication", "Leadership", "Healthcare experience", "Production ownership"],
  avoids: ["Frequent job hopping", "Unexplained resume gaps", "Certification-only experience"],
  learned: "Prefers practical experience over certifications when there is strong production evidence.",
  confidenceTrend: [
    { month: "Mar", confidence: 62 },
    { month: "Apr", confidence: 68 },
    { month: "May", confidence: 73 },
    { month: "Jun", confidence: 79 },
    { month: "Jul", confidence: 84 }
  ],
  timeline: [
    { date: "Apr 14", event: "Override reason emphasized healthcare workflow experience." },
    { date: "May 02", event: "Recruiter approved candidate missing certification due to production API ownership." },
    { date: "Jun 19", event: "Leadership and communication added as strong preference signals." },
    { date: "Jul 07", event: "Memory updated from latest governance decision." }
  ]
};

export const skillInsights = {
  currentMatch: 76,
  missing: ["AWS", "Leadership", "CI/CD"],
  recommendations: [
    { title: "AWS Practitioner", progress: 35, impact: "Raises cloud readiness signal" },
    { title: "Docker Projects", progress: 68, impact: "Validates applied container experience" },
    { title: "System Design", progress: 44, impact: "Improves senior backend confidence" }
  ],
  readiness: "3 months",
  radar: [
    { subject: "Python", value: 92 },
    { subject: "FastAPI", value: 78 },
    { subject: "AWS", value: 46 },
    { subject: "Docker", value: 82 },
    { subject: "Leadership", value: 54 }
  ]
};
