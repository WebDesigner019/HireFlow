import { useEffect, useState } from "react";
import { Bell, Check, Database, Moon, Server, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { applyThemeToDocument, getStoredTheme, themes } from "@/lib/theme";

export default function Settings() {
  const [theme, setTheme] = useState("Light enterprise");
  const [notifications, setNotifications] = useState(true);
  const [model, setModel] = useState("Qwen governance model");
  const [endpoint, setEndpoint] = useState("https://api.hireflow.ai/qwen-cloud");
  const [profileName, setProfileName] = useState("Aisha Rahman");
  const [profileRole, setProfileRole] = useState("Lead Recruiter");
  const [savedSection, setSavedSection] = useState("");
  const [environmentSettings, setEnvironmentSettings] = useState({
    submissionMode: true,
    approvalsRequired: true,
    overrideReasonRequired: true,
    autoAudit: true
  });

  useEffect(() => {
    const nextTheme = getStoredTheme();
    setTheme(nextTheme);
    applyThemeToDocument(nextTheme);
  }, []);

  const save = (section) => {
    setSavedSection(section);
    window.setTimeout(() => setSavedSection(""), 2600);
  };

  const applyTheme = () => {
    applyThemeToDocument(theme);
    window.localStorage.setItem("hireflow-theme", theme);
    save("theme");
  };

  const toggleEnvironment = (key) => {
    setEnvironmentSettings((settings) => ({ ...settings, [key]: !settings[key] }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace Configuration"
        description="Controls for theme, notifications, model routing, API connection, recruiter profile, and governance policy."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <SettingPanel icon={Moon} title="Theme" saved={savedSection === "theme"}>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm focus-ring"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                >
                  <option>Light enterprise</option>
                  <option>High contrast</option>
                  <option>Presentation focus</option>
                </select>
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: themes[theme].color }} />
                  <Button variant="outline" size="sm" onClick={applyTheme}>Apply Theme</Button>
                </div>
              </SettingPanel>

              <SettingPanel icon={Bell} title="Notifications" saved={savedSection === "notifications"}>
                <ToggleRow
                  label="Approval queue alerts"
                  checked={notifications}
                  onChange={() => setNotifications((value) => !value)}
                  testId="notifications-toggle"
                />
                <p className="text-sm font-semibold text-slate-500">{notifications ? "Alerts are on" : "Alerts are muted"}</p>
                <Button variant="outline" size="sm" onClick={() => save("notifications")}>Save Notifications</Button>
              </SettingPanel>

              <SettingPanel icon={Database} title="Model Selection" saved={savedSection === "model"}>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm focus-ring"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                >
                  <option>Qwen governance model</option>
                  <option>Qwen ranking optimized</option>
                  <option>Qwen explainability optimized</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => save("model")}>Use Model</Button>
              </SettingPanel>

              <SettingPanel icon={UserRound} title="Profile" saved={savedSection === "profile"}>
                <Input value={profileName} onChange={(event) => setProfileName(event.target.value)} aria-label="Profile name" />
                <Input value={profileRole} onChange={(event) => setProfileRole(event.target.value)} aria-label="Profile role" />
                <Button variant="outline" size="sm" onClick={() => save("profile")}>Save Profile</Button>
              </SettingPanel>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                API Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button onClick={() => save("endpoint")}>Save Endpoint</Button>
                <Button variant="outline" onClick={() => setEndpoint("http://127.0.0.1:8000")}>Use Localhost</Button>
                {savedSection === "endpoint" ? <Badge variant="green">Endpoint saved</Badge> : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submission Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn("rounded-xl p-4 ring-1", environmentSettings.submissionMode ? "bg-green-50 ring-green-100" : "bg-slate-50 ring-slate-200")}>
              <div className="flex items-center justify-between gap-3">
                <Badge variant={environmentSettings.submissionMode ? "green" : "slate"}>{environmentSettings.submissionMode ? "Submission Ready" : "Needs Review"}</Badge>
                <Toggle checked={environmentSettings.submissionMode} onChange={() => toggleEnvironment("submissionMode")} label="Toggle submission readiness" />
              </div>
              <p className={cn("mt-3 text-sm font-semibold leading-6", environmentSettings.submissionMode ? "text-green-900" : "text-slate-600")}>
                {environmentSettings.submissionMode
                  ? "Governance checkpoints, local workflow state, and submission-ready hiring actions are active."
                  : "Submission readiness is off while configuration is being reviewed."}
              </p>
            </div>

            <ToggleRow label="Human approvals required" checked={environmentSettings.approvalsRequired} onChange={() => toggleEnvironment("approvalsRequired")} testId="approvals-toggle" />
            <ToggleRow label="Require override reason" checked={environmentSettings.overrideReasonRequired} onChange={() => toggleEnvironment("overrideReasonRequired")} testId="override-reason-toggle" />
            <ToggleRow label="Auto-update audit log" checked={environmentSettings.autoAudit} onChange={() => toggleEnvironment("autoAudit")} testId="audit-toggle" />

            <Button className="w-full" onClick={() => save("environment")}>Save Environment Settings</Button>
            {savedSection === "environment" ? <Badge variant="green">Environment settings saved</Badge> : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SettingPanel({ icon: Icon, title, saved, children }) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <p className="font-bold text-slate-950">{title}</p>
        </div>
        {saved ? <Badge variant="green"><Check className="h-3.5 w-3.5" />Saved</Badge> : null}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function ToggleRow({ label, checked, onChange, testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/40 focus-ring"
    >
      <span>{label}</span>
      <Toggle checked={checked} label={label} />
    </button>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <span
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition",
        checked ? "bg-primary" : "bg-slate-300"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </span>
  );
}
