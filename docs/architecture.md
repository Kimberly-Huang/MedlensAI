# MedLens AI architecture

## Frontend
- Landing page at `/`
- Analysis workspace at `/analyze`
- Profile management at `/profile`
- Browser-local profile persistence
- Result report with verdict, score, flags, sources, and recall checks

## Backend
- `POST /api/analyze`
- Rule-based risk scoring engine for stable baseline behavior
- Optional Tavily integration for web evidence
- Optional PubMed integration for literature links
- openFDA enforcement lookup for recall signals

## Request flow
1. User enters supplement or claim in the analysis workspace.
2. Frontend loads the saved profile from local storage.
3. Request is sent to FastAPI backend.
4. Backend computes risk score and optionally fetches live evidence.
5. Frontend renders a full report.
