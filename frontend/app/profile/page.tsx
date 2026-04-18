import NavBar from "../components/NavBar";
import ProfileForm from "../components/ProfileForm";

export default function ProfilePage() {
  return (
    <main className="page-shell">
      <NavBar />
      <section className="section section-top">
        <div className="container narrow-wrap">
          <div className="card">
            <p className="section-kicker">Profile settings</p>
            <h1>Manage your MedLens health profile</h1>
            <p className="muted">This profile is stored locally in the browser and applied automatically in the analysis workspace.</p>
            <ProfileForm />
          </div>
        </div>
      </section>
    </main>
  );
}
