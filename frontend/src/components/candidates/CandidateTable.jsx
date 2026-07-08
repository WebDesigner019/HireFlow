import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SkillTag } from "@/components/SkillTag";
import { MatchScore } from "@/components/MatchScore";
import { Pagination } from "@/components/Pagination";

function statusVariant(status) {
  if (status.includes("Approved")) return "green";
  if (status.includes("Reject")) return "red";
  if (status.includes("Override")) return "violet";
  if (status.includes("Needs")) return "amber";
  return "blue";
}

export function CandidateTable({ candidates, onView }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const pageCandidates = useMemo(() => candidates.slice((page - 1) * pageSize, page * pageSize), [candidates, page]);

  useEffect(() => {
    setPage(1);
  }, [candidates.length]);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Education</th>
              <th className="px-4 py-3">AI Match Score</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageCandidates.map((candidate) => (
              <tr key={candidate.candidate_id} className="bg-white transition hover:bg-blue-50/35">
                <td className="px-4 py-4 font-bold text-slate-950">#{candidate.rank}</td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-950">{candidate.name}</p>
                  <p className="text-xs text-slate-500">{candidate.current_company} - {candidate.location}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">{candidate.photo}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-xs flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 3).map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)}
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-slate-700">{candidate.experience}</td>
                <td className="px-4 py-4 text-slate-600">{candidate.education}</td>
                <td className="px-4 py-4"><MatchScore value={candidate.match_score} /></td>
                <td className="px-4 py-4"><ConfidenceBadge value={candidate.confidence} /></td>
                <td className="px-4 py-4"><Badge variant={statusVariant(candidate.status)}>{candidate.status}</Badge></td>
                <td className="px-4 py-4">
                  <Button variant="outline" size="sm" onClick={() => onView(candidate)}>
                    <Eye className="h-4 w-4" />
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={candidates.length} onPageChange={setPage} />
    </Card>
  );
}
