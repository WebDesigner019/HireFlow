import { PageHeader } from "@/components/layout/PageHeader";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { DecisionLogTable } from "@/components/audit/DecisionLogTable";
import { useGovernance } from "@/context/GovernanceContext";

export default function AuditLog() {
  const { auditLog } = useGovernance();

  return (
    <>
      <PageHeader
        eyebrow="Audit Log"
        title="Full AI Decision Trail"
        description="Every agent action, recommendation, human decision, override, confidence score, data source, and reasoning summary is preserved for governance review."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DecisionLogTable events={auditLog} />
        <AuditTimeline events={auditLog} />
      </div>
    </>
  );
}
