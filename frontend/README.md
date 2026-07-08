# HireFlow - Recruiter Autopilot

HireFlow is an AI-powered recruiter dashboard built for the Qwen Cloud Hackathon. It focuses on human-in-the-loop AI governance for recruiting workflows:

- AI recommends.
- Human approves.
- Every decision is explainable and auditable.

This is not a recruitment landing page. It is an enterprise HR SaaS dashboard for reviewing AI-ranked candidates, approving or overriding recommendations, generating interview drafts, preserving audit logs, and surfacing employer memory and skill gap insights.

## Features

- Enterprise dashboard with candidate metrics, charts, activity, and workflow actions
- Candidate shortlist with ranked table, searchable candidates, match score, confidence, and status
- Candidate detail drawer with resume highlights, matched skills, missing skills, pros, cons, reasoning, data used, and decision actions
- Human approval checkpoint with required override reason and governance timeline
- Audit log with expandable evidence rows and JSON/CSV/PDF export actions
- Interview scheduling with editable AI-generated invitation, regenerate, preview, and send-ready state
- Employer memory page showing learned hiring preferences and confidence trend
- Skill gap insights with match gauge, gap analysis, recommendations, and readiness estimate
- Settings page with working theme switching, endpoint configuration, profile edits, notifications, and governance toggles
- App-wide theme persistence and branded favicon/logo

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router
- Framer Motion
- Lucide React Icons
- shadcn-style reusable UI components
- Recharts
- React Hook Form

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  api/             Mock API layer ready to replace with backend calls
  assets/          Brand assets
  components/      Reusable layout, UI, candidate, audit, approval, and chart components
  context/         Governance state and audit event actions
  data/            Seed data for candidates, jobs, audit log, memory, and skills
  lib/             Utilities and theme helpers
  pages/           Route-level pages
  styles/          Global Tailwind and theme CSS
public/
  favicon.jpeg     HireFlow favicon
```

## Backend Integration

The frontend is structured around an API layer in `src/api/mockApi.js`. Replace those mock functions with real calls to your backend endpoints:

- `GET /jobs`
- `GET /candidates`
- `GET /candidate/:id`
- `GET /audit`
- `GET /memory`
- `GET /skills`
- `POST /approve`
- `POST /override`
- `POST /schedule`
- `POST /upload`

The app-level governance actions live in `src/context/GovernanceContext.jsx`.

## Hackathon Submission Notes

HireFlow is designed to highlight trustworthy AI in recruiting:

- AI recommendations show confidence, reasoning, explanation, data used, and approval status.
- Human overrides require a written reason.
- Approval and override actions update the audit trail.
- Audit logs preserve agent action, confidence, data used, output, reasoning, latency, status, and human override state.

