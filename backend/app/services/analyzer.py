from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

import httpx

from app.config import get_settings
from app.models import AnalyzeRequest, AnalyzeResponse, EvidenceNote, RecallSignal, RiskFlag, SourceCard


@dataclass(frozen=True)
class IngredientRule:
    keywords: tuple[str, ...]
    title: str
    severity: str
    reason: str
    score_delta: int


RISK_RULES: tuple[IngredientRule, ...] = (
    IngredientRule(("ephedra",), "High-risk stimulant ingredient", "high", "Ephedra has a history of serious cardiovascular safety concerns.", 35),
    IngredientRule(("yohimbine",), "Stimulant risk flag", "high", "Yohimbine may increase heart rate, anxiety, and blood pressure in some users.", 24),
    IngredientRule(("caffeine", "energy blend", "guarana"), "Stimulant load", "medium", "Stimulant-heavy formulas can worsen jitters, sleep disruption, or palpitations.", 14),
    IngredientRule(("sugar alcohol", "erythritol", "xylitol", "sorbitol"), "Digestive tolerance concern", "medium", "Sugar alcohols can cause bloating or digestive discomfort for sensitive users.", 10),
    IngredientRule(("red 40", "yellow 5", "blue 1", "artificial dye"), "Artificial additive concern", "low", "Artificial color additives may be a concern for users seeking cleaner formulations.", 7),
    IngredientRule(("proprietary blend",), "Low transparency formula", "medium", "Proprietary blends reduce ingredient transparency and make dosage evaluation harder.", 11),
    IngredientRule(("detox tea", "burns fat quickly", "miracle cure", "no side effects"), "Aggressive marketing claim", "high", "Overstated health claims often signal weak evidence quality or misleading marketing.", 18),
)

ALLERGY_MAP = {
    "dairy": ("milk", "lactose", "whey", "casein"),
    "gluten": ("wheat", "barley", "rye", "malt"),
    "soy": ("soy", "soybean", "soy lecithin"),
    "nuts": ("almond", "cashew", "walnut", "peanut", "hazelnut"),
    "gelatin": ("gelatin",),
}

SENSITIVITY_MAP = {
    "caffeine": ("caffeine", "guarana", "green tea extract"),
    "sugar alcohols": ("erythritol", "xylitol", "sorbitol", "sugar alcohol"),
    "artificial colors": ("red 40", "yellow 5", "blue 1", "artificial dye"),
}

CLAIM_PATTERNS = (
    (re.compile(r"sleep|stress|calm", re.I), "medium", "Some ingredients may have limited or mixed support for sleep or stress-related outcomes."),
    (re.compile(r"immune|immunity", re.I), "medium", "Immune-related claims are often overstated relative to the actual strength of consumer-facing evidence."),
    (re.compile(r"burn fat|weight loss|detox", re.I), "low", "Rapid weight loss and detox claims are typically lower-confidence and need careful scrutiny."),
    (re.compile(r"improve focus|energy", re.I), "medium", "Energy and focus claims may be directionally plausible but often depend heavily on dose and user tolerance."),
    (re.compile(r"cure|treat|reverse", re.I), "low", "Disease-treatment language is a major caution signal outside regulated clinical contexts."),
)

DOSAGE_PATTERNS = (
    (re.compile(r"3000\s?mg", re.I), 15, "High single-serving dosage noted"),
    (re.compile(r"megadose", re.I), 15, "Megadose language noted"),
)


def _normalized_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _match_any(text: str, keywords: Iterable[str]) -> bool:
    return any(keyword in text for keyword in keywords)


async def fetch_tavily_sources(query: str) -> list[SourceCard]:
    settings = get_settings()
    if not settings.tavily_api_key:
        return []
    payload = {
        "api_key": settings.tavily_api_key,
        "query": f"{query} supplement safety evidence health risks",
        "search_depth": "basic",
        "max_results": 3,
        "include_answer": False,
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post("https://api.tavily.com/search", json=payload)
            response.raise_for_status()
            data = response.json()
        results = data.get("results", [])
        return [
            SourceCard(
                title=item.get("title", "Web evidence"),
                url=item.get("url", ""),
                source_type="web",
                summary=item.get("content", "")[:240] or "Search result relevant to the queried claim.",
            )
            for item in results if item.get("url")
        ]
    except Exception:
        return []


async def fetch_pubmed_sources(query: str) -> list[SourceCard]:
    settings = get_settings()
    email = settings.pubmed_email or "demo@example.com"
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            search = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                params={
                    "db": "pubmed",
                    "term": query,
                    "retmode": "json",
                    "retmax": 3,
                    "email": email,
                },
            )
            search.raise_for_status()
            ids = search.json().get("esearchresult", {}).get("idlist", [])
            if not ids:
                return []
            summary = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                params={
                    "db": "pubmed",
                    "id": ",".join(ids),
                    "retmode": "json",
                    "email": email,
                },
            )
            summary.raise_for_status()
            data = summary.json().get("result", {})
        cards: list[SourceCard] = []
        for pmid in ids:
            item = data.get(pmid)
            if not item:
                continue
            cards.append(SourceCard(
                title=item.get("title", "PubMed article"),
                url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                source_type="pubmed",
                summary=f"PubMed record from {item.get('fulljournalname', 'medical literature')}.",
            ))
        return cards
    except Exception:
        return []


async def fetch_openfda_recall_signals(query: str) -> list[RecallSignal]:
    terms = query.split()[:4]
    if not terms:
        return []
    search_term = " OR ".join([f'product_description:"{t}"' for t in terms])
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                "https://api.fda.gov/food/enforcement.json",
                params={"search": search_term, "limit": 2},
            )
            if response.status_code >= 400:
                return []
            results = response.json().get("results", [])
        signals = []
        for item in results:
            product = item.get("product_description", "Potential regulatory signal")
            reason = item.get("reason_for_recall", "Recall-related signal found in openFDA.")
            status = item.get("status", "Unknown")
            signals.append(RecallSignal(title=product, status=status, summary=reason))
        return signals
    except Exception:
        return []


async def analyze_request(payload: AnalyzeRequest) -> AnalyzeResponse:
    text = _normalized_text(payload.query)

    base_score = 22
    confidence = 76
    risk_flags: list[RiskFlag] = []
    evidence_notes: list[EvidenceNote] = []

    for rule in RISK_RULES:
        if _match_any(text, rule.keywords):
            base_score += rule.score_delta
            risk_flags.append(RiskFlag(title=rule.title, severity=rule.severity, reason=rule.reason))

    for pattern, score_delta, label in DOSAGE_PATTERNS:
        if pattern.search(text):
            base_score += score_delta
            risk_flags.append(RiskFlag(title=label, severity="medium", reason="Higher-dose products deserve closer review for tolerance and appropriateness."))

    allergy_hits: list[str] = []
    for allergy in payload.profile.allergies:
        mapped = ALLERGY_MAP.get(allergy.lower())
        if mapped and _match_any(text, mapped):
            allergy_hits.append(allergy)
            base_score += 26
            risk_flags.append(RiskFlag(title=f"Allergy match: {allergy}", severity="high", reason=f"The query appears to include ingredients associated with the listed allergy: {allergy}."))

    sensitivity_hits: list[str] = []
    for sensitivity in payload.profile.sensitivities:
        mapped = SENSITIVITY_MAP.get(sensitivity.lower())
        if mapped and _match_any(text, mapped):
            sensitivity_hits.append(sensitivity)
            base_score += 12
            risk_flags.append(RiskFlag(title=f"Sensitivity match: {sensitivity}", severity="medium", reason=f"The query includes content that may trigger the listed sensitivity: {sensitivity}."))

    evidence_added = False
    for pattern, strength, summary in CLAIM_PATTERNS:
        if pattern.search(text):
            evidence_notes.append(EvidenceNote(label="Claim evidence signal", strength=strength, summary=summary))
            evidence_added = True
            if strength == "low":
                base_score += 10
                confidence -= 9
            elif strength == "medium":
                base_score += 4
                confidence -= 2
            break

    if "gummy" in text:
        evidence_notes.append(EvidenceNote(label="Formulation note", strength="medium", summary="Gummy products can improve adherence but may add sugars, gelatin, or tolerance issues depending on formulation."))
    if not evidence_added:
        evidence_notes.append(EvidenceNote(label="Evidence signal", strength="medium", summary="The current review is based mainly on formulation, ingredient, wording, and profile-related risk cues."))

    med_hits = []
    for med in payload.profile.medications:
        if med.lower() in text:
            med_hits.append(med)
            base_score += 10
            risk_flags.append(RiskFlag(title=f"Medication overlap: {med}", severity="medium", reason="This input mentions a medication already listed in the profile and may deserve a more detailed interaction review."))

    if payload.profile.conditions:
        evidence_notes.append(EvidenceNote(label="Condition-aware caution", strength="medium", summary="The result should be interpreted more carefully when the user has relevant medical conditions, especially for stimulant or high-dose products."))

    base_score = max(0, min(100, base_score))
    confidence = max(45, min(95, confidence))

    if base_score >= 70:
        verdict = "HIGH RISK"
        summary = "This input shows multiple safety or credibility concerns and should be reviewed carefully before use."
        next_steps = [
            "Review the full ingredient list and dosage details.",
            "Avoid relying on strong marketing claims without stronger evidence.",
            "Consult a licensed clinician or pharmacist if you have relevant conditions, allergies, or medications.",
        ]
    elif base_score >= 40:
        verdict = "CAUTION"
        summary = "This input is not automatically unsafe, but it includes risk cues that deserve closer review."
        next_steps = [
            "Check serving size and ingredient transparency.",
            "Compare the claim with a trusted health source before purchase.",
            "Use extra caution if you have allergies, medications, or known sensitivities.",
        ]
    else:
        verdict = "SAFE"
        summary = "No major red flags were detected from the current text, though this is not a substitute for medical advice."
        next_steps = [
            "Confirm the ingredient list and dosage before use.",
            "Use reputable brands with transparent labeling.",
            "Reassess if your personal health status changes.",
        ]

    personalized_parts: list[str] = []
    if allergy_hits:
        personalized_parts.append(f"Your profile indicates allergies related to {', '.join(allergy_hits)}, which directly increased the risk assessment.")
    if sensitivity_hits:
        personalized_parts.append(f"Your listed sensitivities to {', '.join(sensitivity_hits)} also influenced the caution level.")
    if med_hits:
        personalized_parts.append(f"The analysis also noticed overlap with listed medications: {', '.join(med_hits)}.")
    if not personalized_parts:
        personalized_parts.append("No direct profile matches were detected, so the result is driven mostly by claim wording, ingredient cues, and dosage patterns.")

    if not risk_flags:
        risk_flags.append(RiskFlag(title="No major direct flag found", severity="low", reason="The current text did not trigger any high-signal ingredient or marketing warnings."))

    sources = []
    sources.extend(await fetch_tavily_sources(payload.query))
    pubmed_query = payload.query if len(payload.query) < 100 else payload.query[:100]
    sources.extend(await fetch_pubmed_sources(pubmed_query))
    recall_signals = await fetch_openfda_recall_signals(payload.query)

    return AnalyzeResponse(
        verdict=verdict,
        risk_score=base_score,
        confidence=confidence,
        short_summary=summary,
        personalized_note=" ".join(personalized_parts),
        risk_flags=risk_flags[:6],
        evidence_notes=evidence_notes[:4],
        suggested_next_steps=next_steps,
        sources=sources[:6],
        recall_signals=recall_signals,
    )
