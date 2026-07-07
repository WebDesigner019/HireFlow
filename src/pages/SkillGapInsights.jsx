import { useEffect, useState } from "react";
import { Gauge, Radar as RadarIcon } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/MatchScore";
import { api } from "@/api/mockApi";

export default function SkillGapInsights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    api.getSkills().then(setInsights);
  }, []);

  if (!insights) return null;

  return (
    <>
      <PageHeader
        eyebrow="Skill Gap Insights"
        title="Candidate Readiness Dashboard"
        description="Explain why a candidate is close, which gaps reduce confidence, and what actions increase readiness for the current role."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" />Current Match</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <MatchScore value={insights.currentMatch} size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Estimated readiness</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{insights.readiness}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {insights.missing.map((skill) => <Badge key={skill} variant="amber">{skill}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><RadarIcon className="h-5 w-5 text-primary" />Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={insights.radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Tooltip />
                  <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.22} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {insights.recommendations.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-950">{item.title}</p>
                    <span className="text-sm font-bold text-primary">{item.progress}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
