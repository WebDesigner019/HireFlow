import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/mockApi";

export default function EmployerMemory() {
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    api.getMemory().then(setMemory);
  }, []);

  if (!memory) return null;

  return (
    <>
      <PageHeader
        eyebrow="Employer Memory"
        title="Recruiter Preferences Learned Over Time"
        description="HireFlow summarizes stable employer preferences from prior human decisions while keeping the source behavior explainable."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Employer Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-3 flex items-center gap-2 font-bold text-green-950"><CheckCircle2 className="h-5 w-5" />Usually values</p>
              <div className="flex flex-wrap gap-2">
                {memory.preferences.map((item) => <Badge key={item} variant="green">{item}</Badge>)}
              </div>
            </section>
            <section className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="mb-3 flex items-center gap-2 font-bold text-red-950"><XCircle className="h-5 w-5" />Avoids</p>
              <div className="flex flex-wrap gap-2">
                {memory.avoids.map((item) => <Badge key={item} variant="red">{item}</Badge>)}
              </div>
            </section>
            <section className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="flex items-center gap-2 font-bold text-slate-950"><BrainCircuit className="h-5 w-5 text-primary" />Previous overrides</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{memory.learned}</p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-success" />Confidence Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memory.confidenceTrend}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line dataKey="confidence" stroke="#16A34A" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Memory Evolution Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {memory.timeline.map((item) => (
            <div key={item.date} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.date}</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">{item.event}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
