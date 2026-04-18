import NavBar from "./components/NavBar";

export default function HomePage() {
  return (
    <main className="page-shell">
      <NavBar />
      <section className="hero hero-large">
        <div className="container hero-grid landing-grid">
          <div className="hero-copy">
            <div className="hero-chip-row">
              <span className="chip">Healthcare software</span>
              <span className="chip">Profile-aware analysis</span>
              <span className="chip">Evidence retrieval</span>
            </div>
            <h1>Analyze supplements and health claims like a real product, not a static demo.</h1>
            <p>
              MedLens AI is a full-stack health risk intelligence app for supplements, ingredients, and wellness claims.
              It combines a real frontend, a real backend, live evidence retrieval, personalized safety logic, and a
              report-style result view designed for actual product use.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/analyze">Open workspace</a>
              <a className="button button-secondary" href="#how">How it works</a>
            </div>
            <div className="stat-row">
              <div className="stat-card"><strong>Real analysis flow</strong><span>Next.js to FastAPI to source cards</span></div>
              <div className="stat-card"><strong>Profile-aware</strong><span>Allergies, sensitivities, meds, and goals</span></div>
              <div className="stat-card"><strong>Live enrichment</strong><span>PubMed, Tavily, and openFDA</span></div>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-title">What the software returns</div>
            <div className="mini-list">
              <div className="mini-row"><strong>Verdict</strong><div className="muted">SAFE, CAUTION, or HIGH RISK</div></div>
              <div className="mini-row"><strong>Risk drivers</strong><div className="muted">Ingredient, dosage, and claim-based flags</div></div>
              <div className="mini-row"><strong>Personalized note</strong><div className="muted">Explains how the user profile changed the result</div></div>
              <div className="mini-row"><strong>Live sources</strong><div className="muted">Search and literature cards when API keys are configured</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="product">
        <div className="container feature-grid">
          <div className="feature-card"><div className="feature-eyebrow">Input layer</div><h3>Product, ingredient, or claim</h3><p className="muted">Paste a supplement description, ingredient list, or marketing claim in natural language.</p></div>
          <div className="feature-card"><div className="feature-eyebrow">Profile layer</div><h3>User-specific risk adjustment</h3><p className="muted">Allergies, sensitivities, medications, conditions, and goals influence the final assessment.</p></div>
          <div className="feature-card"><div className="feature-eyebrow">Evidence layer</div><h3>External data enrichment</h3><p className="muted">The backend can enrich results with search evidence, PubMed literature, and regulatory recall checks.</p></div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container narrative-grid">
          <div className="card">
            <p className="section-kicker">How it works</p>
            <h2>Simple on the surface, structured underneath</h2>
            <ol className="clean-list ordered">
              <li>The user submits a supplement or health claim.</li>
              <li>The app reads a saved health profile from local browser storage.</li>
              <li>The backend scores risk based on ingredient cues, dosage patterns, and risky language.</li>
              <li>The backend optionally adds live evidence from Tavily, PubMed, and openFDA.</li>
              <li>The UI renders a full result report with source cards and recall signals.</li>
            </ol>
          </div>
          <div className="card">
            <p className="section-kicker">Built for a real repo</p>
            <h2>What makes this version GitHub-worthy</h2>
            <ul className="clean-list">
              <li>Clear positioning around healthcare intelligence</li>
              <li>Dedicated workspace page instead of a landing-only mockup</li>
              <li>Real API architecture and API-key configuration</li>
              <li>Profile persistence for repeated use</li>
              <li>Explainable report output instead of a single score bubble</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
