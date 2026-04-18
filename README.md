# MedLens AI

MedLens AI is a full-stack healthcare intelligence web app that evaluates supplements, wellness products, and consumer health claims using profile-aware risk analysis and live evidence retrieval.

## What this version is

This is **not** a static demo page. It is a working product shell with:

- a real Next.js application
- a real FastAPI backend
- live analysis requests from frontend to backend
- optional API-key powered evidence retrieval from Tavily, PubMed, and openFDA
- profile-aware risk adjustments based on allergies, sensitivities, dietary preferences, and goals
- source cards, recall checks, and explainable output

## Product positioning

**MedLens AI** helps health-conscious consumers evaluate supplements and wellness claims before purchase.

Examples:
- “Ashwagandha gummies for sleep with gelatin and sugar alcohols”
- “Detox tea burns fat fast with no side effects”
- “Pre-workout with caffeine, niacin, and beta alanine”

The system returns:
- risk verdict
- risk score
- evidence summary
- personalized safety notes
- live sources when configured
- FDA recall / enforcement signals when available

## Stack

### Frontend
- Next.js 14
- React
- TypeScript
- CSS modules-free custom styling in `globals.css`

### Backend
- FastAPI
- Pydantic
- httpx
- Python 3.11+

### External data integrations
- Tavily search API for web evidence
- PubMed E-utilities for medical literature lookup
- openFDA enforcement API for recall checks

## Run locally

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.
Backend runs at `http://127.0.0.1:8000`.

## Environment variables

### backend/.env
```bash
TAVILY_API_KEY=
PUBMED_EMAIL=your_email@example.com
```

### frontend/.env.local
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Notes

- If no external API keys are provided, the app still works using the built-in risk engine.
- With API keys configured, the app returns richer evidence and source cards.
- This repo is designed to be GitHub-ready and portfolio-ready.
