"use client";

interface ChatSizeSelectorProps {
  sizes: string[];
  onSelect: (size: string) => void;
  disabled?: boolean;
}

export function ChatSizeSelector({ sizes, onSelect, disabled = false }: ChatSizeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {sizes.map((size) => (
        <button
          key={size}
          className="size-pill"
          onClick={() => !disabled && onSelect(size)}
          disabled={disabled}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
