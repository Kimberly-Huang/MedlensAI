"use client";

import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import ProfileForm from "../components/ProfileForm";
import ResultPanel from "../components/ResultPanel";
import { AnalyzeResponse, Profile } from "../components/types";

const starterQueries = [
  "Ashwagandha gummies for sleep with gelatin and sugar alcohols",
  "Vitamin C megadose supplement, 3000mg per serving",
  "Detox tea burns fat quickly with no side effects",
  "Pre-workout with caffeine, niacin, beta alanine, and artificial dyes",
];

const emptyProfile: Profile = {
  allergies: [],
  sensitivities: [],
  dietary_preferences: [],
  health_goals: [],
  medications: [],
  conditions: [],
};

export default function AnalyzePage() {
  const [query, setQuery] = useState(starterQueries[0]);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    const existing = window.localStorage.getItem("medlens-profile");
    if (existing) {
      try {
        setProfile(JSON.parse(existing) as Profile);
      } catch {}
    }
  }, []);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, profile }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Analysis failed.");
      }
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <NavBar />
      <section className="section section-top">
        <div className="container workspace-grid">
          <div className="workspace-left">
            <div className="card">
              <p className="section-kicker">Workspace</p>
              <h1>Analyze a supplement, ingredient list, or claim</h1>
              <p className="muted">This is the actual software workspace. Add your profile, submit a product description, and review a full result report.</p>
              <div className="field"><label>What should MedLens analyze?</label><textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={7} placeholder="Paste a supplement description, ingredient list, or wellness claim" /></div>
              <div className="sample-wrap">
                {starterQueries.map((item) => (
                  <button type="button" className="sample-chip" key={item} onClick={() => setQuery(item)}>{item}</button>
                ))}
              </div>
              <div className="actions-row">
                <button className="button button-primary" type="button" onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Run analysis"}</button>
                <button className="button button-secondary" type="button" onClick={() => { setResult(null); setError(null); }}>Clear result</button>
              </div>
              {error ? <div className="error-box">{error}</div> : null}
            </div>

            <div className="card">
              <p className="section-kicker">Profile</p>
              <h2>Personal health profile</h2>
              <p className="muted">Saved in the browser and reused for future analyses.</p>
              <ProfileForm onChange={setProfile} />
            </div>
          </div>

          <div className="workspace-right">
            <ResultPanel result={result} />
          </div>
        </div>
      </section>
    </main>
  );
}
