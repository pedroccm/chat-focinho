"use client";

import { PRICING } from "@/lib/constants";

interface ChatProductSelectorProps {
  onSelect: (productId: string) => void;
  disabled?: boolean;
}

export function ChatProductSelector({ onSelect, disabled = false }: ChatProductSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {PRICING.map((product) => (
        <button
          key={product.id}
          className={`product-card ${product.highlighted ? "highlighted" : ""}`}
          onClick={() => !disabled && onSelect(product.id)}
          disabled={disabled}
          style={{ textAlign: "left", cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-fraunces), serif" }}>
                {product.name}
              </span>
              {product.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: "var(--terracotta)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 50,
                    marginLeft: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--terracotta)" }}>
              {product.price}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {product.features.slice(0, 3).map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 11,
                  color: "var(--earth-light)",
                  background: "var(--sand)",
                  padding: "2px 8px",
                  borderRadius: 50,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
