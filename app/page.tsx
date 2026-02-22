export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold text-text text-center mb-4">
        buildlog
      </h1>
      <p className="font-[family-name:var(--font-serif)] text-text-muted text-lg text-center max-w-lg mb-2">
        git log for your AI coding sessions.
      </p>
      <p className="font-mono text-sm text-text-dim text-center">
        Coming soon.
      </p>
    </div>
  );
}
