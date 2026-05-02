import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <h1 className="mb-2 text-4xl font-bold" style={{ color: "var(--color-text)" }}>
        404
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        This page does not exist.
      </p>
      <Link
        href="/"
        className="rounded-lg px-4 py-2 text-sm transition-colors hover:text-white"
        style={{ border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
      >
        ← Back to comparison
      </Link>
    </main>
  );
}
