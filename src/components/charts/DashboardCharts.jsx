import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const matchData = [
  { range: "90-100", candidates: 2 },
  { range: "80-89", candidates: 1 },
  { range: "70-79", candidates: 1 },
  { range: "60-69", candidates: 1 }
];

const approvalData = [
  { name: "Approved", value: 62, color: "#16A34A" },
  { name: "Pending", value: 26, color: "#F59E0B" },
  { name: "Rejected", value: 12, color: "#DC2626" }
];

const funnelData = [
  { name: "Uploaded", value: 148, fill: "#2563EB" },
  { name: "Ranked", value: 86, fill: "#3B82F6" },
  { name: "Reviewed", value: 42, fill: "#16A34A" },
  { name: "Interview", value: 18, fill: "#F59E0B" }
];

const trendData = [
  { day: "Mon", approved: 18, overrides: 2 },
  { day: "Tue", approved: 24, overrides: 4 },
  { day: "Wed", approved: 21, overrides: 3 },
  { day: "Thu", approved: 29, overrides: 5 },
  { day: "Fri", approved: 33, overrides: 4 }
];

export function CandidatesByMatchChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates by Match Score</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={matchData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="range" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "#EFF6FF" }} />
            <Bar dataKey="candidates" radius={[10, 10, 0, 0]} fill="#2563EB" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ApprovalRateChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Rate</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={approvalData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
              {approvalData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="-mt-8 flex justify-center gap-4 text-xs font-semibold text-slate-500">
          {approvalData.map((item) => (
            <span key={item.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelineFunnelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList position="right" fill="#334155" stroke="none" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ApprovalTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance Throughput</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="approved" stroke="#16A34A" fill="url(#approvedGradient)" strokeWidth={3} />
            <Area type="monotone" dataKey="overrides" stroke="#DC2626" fill="#FEE2E2" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
