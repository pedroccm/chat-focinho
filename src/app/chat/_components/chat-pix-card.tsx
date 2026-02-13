"use client";

import { useState } from "react";

interface ChatPixCardProps {
  qrCodeImage: string;
  brCode: string;
  amount: number;
  pixId: string;
  orderId: string;
}

export function ChatPixCard({ qrCodeImage, brCode, amount }: ChatPixCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const el = document.createElement("textarea");
      el.value = brCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedAmount = (amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="pix-card">
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--earth)", marginBottom: 4 }}>
        Pagamento PIX
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: "var(--terracotta)", marginBottom: 12 }}>
        {formattedAmount}
      </p>

      {qrCodeImage && (
        <img
          src={qrCodeImage.startsWith("data:") ? qrCodeImage : `data:image/png;base64,${qrCodeImage}`}
          alt="QR Code PIX"
          style={{ maxWidth: 200, margin: "0 auto", display: "block" }}
        />
      )}

      <p style={{ fontSize: 12, color: "var(--earth-light)", margin: "12px 0 8px" }}>
        Ou copie o codigo PIX:
      </p>
      <div className="pix-brcode" onClick={handleCopy}>
        {copied ? "Copiado!" : brCode.length > 60 ? `${brCode.slice(0, 60)}...` : brCode}
      </div>
      <button
        onClick={handleCopy}
        className="confirm-btn"
        style={{ marginTop: 12, width: "100%" }}
      >
        {copied ? "Copiado!" : "Copiar codigo PIX"}
      </button>
      <p style={{ fontSize: 11, color: "var(--earth-light)", marginTop: 8 }}>
        Expira em 30 minutos
      </p>
    </div>
  );
}
