export default function NavBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <a href="/" className="brand-link">
          <div className="brand">
            <span className="brand-badge">M</span>
            <span>MedLens AI</span>
          </div>
        </a>
        <div className="top-links">
          <a href="/analyze">Analyze</a>
          <a href="/profile">Profile</a>
          <a href="#product">Product</a>
          <a href="#how">How it works</a>
        </div>
      </div>
    </div>
  );
}
