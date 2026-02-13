"use client";

interface ChatProgressProps {
  progress: number;
}

export function ChatProgress({ progress }: ChatProgressProps) {
  return (
    <div style={{ width: "100%" }}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p style={{ fontSize: 12, color: "var(--earth-light)", marginTop: 6, textAlign: "center" }}>
        {progress < 100
          ? `Criando retrato... ${Math.round(progress)}%`
          : "Pronto!"}
      </p>
    </div>
  );
}
