import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Candidates from "@/pages/Candidates";
import ApprovalQueue from "@/pages/ApprovalQueue";
import AuditLog from "@/pages/AuditLog";
import InterviewScheduling from "@/pages/InterviewScheduling";
import EmployerMemory from "@/pages/EmployerMemory";
import SkillGapInsights from "@/pages/SkillGapInsights";
import Settings from "@/pages/Settings";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

export default function App() {
  const location = useLocation();

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/approval" element={<ApprovalQueue />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/scheduling" element={<InterviewScheduling />} />
            <Route path="/memory" element={<EmployerMemory />} />
            <Route path="/skills" element={<SkillGapInsights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
