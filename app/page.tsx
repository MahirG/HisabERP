export default function HomePage() {
  return (
    <main className="app-shell">
      <iframe
        className="legacy-app"
        src="/legacy"
        title="Hisab ERP"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
