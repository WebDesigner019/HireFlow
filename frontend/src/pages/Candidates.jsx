import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { CandidateDrawer } from "@/components/candidates/CandidateDrawer";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { SearchBar } from "@/components/SearchBar";
import { Filters } from "@/components/Filters";
import { useGovernance } from "@/context/GovernanceContext";

export default function Candidates() {
  const { candidates } = useGovernance();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return candidates.filter((candidate) =>
      [candidate.name, candidate.current_company, candidate.location, ...candidate.skills].join(" ").toLowerCase().includes(value)
    );
  }, [candidates, query]);

  return (
    <>
      <PageHeader
        eyebrow="Candidate Shortlist"
        title="Explainable AI Ranking"
        description="Search and review ranked candidates with transparent reasoning, confidence, matched skills, missing skills, and human approval status."
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <SearchBar value={query} onChange={setQuery} placeholder="Search candidates, skills, company, location..." />
        <Filters>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <option>All statuses</option>
            <option>Pending Review</option>
            <option>Pending Approval</option>
            <option>Needs Review</option>
          </select>
        </Filters>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        {filtered.slice(0, 2).map((candidate) => (
          <CandidateCard key={candidate.candidate_id} candidate={candidate} onView={() => setSelected(candidate)} />
        ))}
      </div>

      <CandidateTable candidates={filtered} onView={setSelected} />
      <CandidateDrawer candidate={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </>
  );
}
