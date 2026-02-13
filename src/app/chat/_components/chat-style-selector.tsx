"use client";

import { STYLES } from "@/lib/constants";

interface ChatStyleSelectorProps {
  onSelect: (styleId: string) => void;
  disabled?: boolean;
}

export function ChatStyleSelector({ onSelect, disabled = false }: ChatStyleSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {STYLES.map((style) => (
        <button
          key={style.id}
          className="style-btn"
          onClick={() => !disabled && onSelect(style.id)}
          disabled={disabled}
        >
          <span style={{ fontSize: 24 }}>{style.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{style.name}</span>
        </button>
      ))}
    </div>
  );
}
