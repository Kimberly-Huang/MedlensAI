from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import analyze_request

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Profile-aware health claim and supplement risk analysis API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "medlens-api"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    return await analyze_request(payload)
