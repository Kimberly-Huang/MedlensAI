from typing import Literal
from pydantic import BaseModel, Field


Verdict = Literal["SAFE", "CAUTION", "HIGH RISK"]
Level = Literal["low", "medium", "high"]


class UserProfile(BaseModel):
    allergies: list[str] = Field(default_factory=list)
    sensitivities: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list)
    health_goals: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    profile: UserProfile = Field(default_factory=UserProfile)


class RiskFlag(BaseModel):
    title: str
    severity: Level
    reason: str


class EvidenceNote(BaseModel):
    label: str
    strength: Level
    summary: str


class SourceCard(BaseModel):
    title: str
    url: str
    source_type: Literal["web", "pubmed", "regulatory"]
    summary: str


class RecallSignal(BaseModel):
    title: str
    status: str
    summary: str
    url: str | None = None


class AnalyzeResponse(BaseModel):
    verdict: Verdict
    risk_score: int
    confidence: int
    short_summary: str
    personalized_note: str
    risk_flags: list[RiskFlag]
    evidence_notes: list[EvidenceNote]
    suggested_next_steps: list[str]
    sources: list[SourceCard] = Field(default_factory=list)
    recall_signals: list[RecallSignal] = Field(default_factory=list)
