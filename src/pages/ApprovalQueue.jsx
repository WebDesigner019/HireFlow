import { useLocation } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApprovalCard } from "@/components/approval/ApprovalCard";
import { useGovernance } from "@/context/GovernanceContext";

export default function ApprovalQueue() {
  const { candidates } = useGovernance();
  const location = useLocation();
  const candidateId = location.state?.candidateId || "c123";
  const candidate = candidates.find((item) => item.candidate_id === candidateId) || candidates[0];

  return (
    <>
      <PageHeader
        eyebrow="Human Approval Checkpoint"
        title="AI Recommends. Human Approves."
        description="This checkpoint requires a recruiter decision before the AI recommendation can affect the hiring pipeline. Overrides require a written reason and are logged instantly."
      />
      <ApprovalCard candidate={candidate} />
    </>
  );
}
