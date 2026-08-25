import { createRoot } from "react-dom/client";
import "./index.css";

// App is loaded dynamically so a throw during module evaluation lands in the
// catch below rather than leaving a blank page whose only clue is a console
// error. Nothing throws at import time today, but the guard costs one await
// and has already saved a debugging session once.
async function boot() {
  const root = createRoot(document.getElementById("root")!);
  try {
    const { default: App } = await import("./App.tsx");
    root.render(<App />);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isEnvProblem = message.includes("[api]");
    console.error(err);
    root.render(<SetupScreen message={message} isEnvProblem={isEnvProblem} />);
  }
}

function SetupScreen({
  message,
  isEnvProblem,
}: {
  message: string;
  isEnvProblem: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#0b1220",
        color: "#e2e8f0",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "42rem", width: "100%" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {isEnvProblem ? "Backend not configured" : "The app failed to start"}
        </h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          {isEnvProblem
            ? "The site loaded, but it has no backend API to talk to. This is a setup step, not a bug in the site."
            : "An error was thrown while loading the application."}
        </p>
        <pre
          style={{
            background: "#111c30",
            border: "1px solid #1e293b",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            overflowX: "auto",
            color: "#fca5a5",
            marginBottom: "1.5rem",
          }}
        >
          {message}
        </pre>
        {isEnvProblem && (
          <div style={{ fontSize: "0.9375rem", lineHeight: 1.8, color: "#cbd5e1" }}>
            <strong style={{ color: "#e2e8f0" }}>To fix:</strong>
            <ol style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li>
                In <code style={{ color: "#7dd3fc" }}>change-suture-backend</code>, copy{" "}
                <code style={{ color: "#7dd3fc" }}>.env.example</code> to{" "}
                <code style={{ color: "#7dd3fc" }}>.env</code> and fill in{" "}
                <code style={{ color: "#7dd3fc" }}>DATABASE_URL</code> and the JWT secrets
              </li>
              <li>
                Run <code style={{ color: "#7dd3fc" }}>npm run migrate</code>,{" "}
                <code style={{ color: "#7dd3fc" }}>npm run seed</code> and{" "}
                <code style={{ color: "#7dd3fc" }}>npm run seed:admin</code>
              </li>
              <li>
                Start it with <code style={{ color: "#7dd3fc" }}>npm run dev</code> (listens
                on port 4000 by default)
              </li>
              <li>
                Point this app at it via{" "}
                <code style={{ color: "#7dd3fc" }}>VITE_API_URL</code> in{" "}
                <code style={{ color: "#7dd3fc" }}>.env</code>, then restart the dev server
              </li>
            </ol>
            <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "0.875rem" }}>
              Full walkthrough: <code>BOOTSTRAP.md</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

boot();
