import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MatchScore } from "@/components/MatchScore";
import { SkillTag } from "@/components/SkillTag";

function statusVariant(status) {
  if (status.includes("Approved")) return "green";
  if (status.includes("Reject")) return "red";
  if (status.includes("Override")) return "violet";
  if (status.includes("Needs")) return "amber";
  return "blue";
}

export function CandidateCard({ candidate, onView }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            {candidate.photo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-950">{candidate.name}</p>
                <p className="text-sm text-slate-500">{candidate.experience} at {candidate.current_company}</p>
              </div>
              <Badge variant={statusVariant(candidate.status)}>{candidate.status}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {candidate.location}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 4).map((skill) => (
                <SkillTag key={skill}>{skill}</SkillTag>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <MatchScore value={candidate.match_score} />
              <ConfidenceBadge value={candidate.confidence} />
              <Button variant="outline" size="sm" onClick={onView}>View Details</Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
