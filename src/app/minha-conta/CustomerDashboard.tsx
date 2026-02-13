"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

interface Order {
  order_id: string;
  product_type: string;
  size: string | null;
  price_cents: number;
  status: string;
  tracking_code: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  created_at: string;
  style: string;
  generated_image_path: string | null;
  watermarked_image_path: string | null;
}

interface Props {
  userName: string;
  userEmail: string;
  orders: Order[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Aguardando Pagamento", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  paid: { label: "Pago", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  processing: { label: "Processando", color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  shipped: { label: "Enviado", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  delivered: { label: "Entregue", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  cancelled: { label: "Cancelado", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

const PRODUCT_LABELS: Record<string, string> = {
  digital: "Download Digital",
  print: "Fine Art Print",
  canvas: "Quadro Canvas",
};

const STYLE_LABELS: Record<string, string> = {
  renaissance: "Renascenca",
  baroque: "Barroco",
  victorian: "Vitoriano",
};

export default function CustomerDashboard({ userName, userEmail, orders }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/chat");
    router.refresh();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  };

  const handleDownload = async (orderId: string) => {
    try {
      const response = await fetch(`/api/download?orderId=${orderId}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fotofocinho-portrait-${orderId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Erro ao baixar. Tente novamente.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--sand)",
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      {/* Header */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--sage-light)",
          background: "var(--cream)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/chat"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--earth)",
            textDecoration: "none",
          }}
        >
          fotofocinho
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/chat"
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--earth-light)",
              textDecoration: "none",
              borderRadius: 50,
              transition: "background 0.2s",
            }}
          >
            Novo Retrato
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#dc2626",
              background: "none",
              border: "none",
              borderRadius: 50,
              cursor: loggingOut ? "not-allowed" : "pointer",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            {loggingOut ? "..." : "Sair"}
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--earth)",
              marginBottom: 4,
            }}
          >
            Ola, {userName}!
          </h1>
          <p style={{ fontSize: 14, color: "var(--earth-light)" }}>{userEmail}</p>
        </div>

        {/* Orders */}
        <h2
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--terracotta)",
            marginBottom: 16,
          }}
        >
          Meus Pedidos ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div
            style={{
              background: "var(--cream)",
              border: "1px solid var(--sage-light)",
              borderRadius: 16,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--earth)",
                marginBottom: 8,
              }}
            >
              Nenhum pedido ainda
            </h3>
            <p style={{ fontSize: 14, color: "var(--earth-light)", marginBottom: 20 }}>
              Crie seu primeiro retrato e veja aqui!
            </p>
            <Link
              href="/chat"
              className="confirm-btn"
              style={{
                display: "inline-block",
                textDecoration: "none",
                color: "white",
              }}
            >
              Criar Retrato
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || {
                label: order.status,
                color: "#6b7280",
                bg: "rgba(107,114,128,0.1)",
              };
              const canDownload =
                order.product_type === "digital" &&
                ["paid", "delivered"].includes(order.status) &&
                order.generated_image_path;
              const watermarkedUrl = order.watermarked_image_path
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/watermarked/${order.watermarked_image_path}`
                : null;

              return (
                <div
                  key={order.order_id}
                  style={{
                    background: "var(--cream)",
                    border: "1px solid var(--sage-light)",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    gap: 14,
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "var(--sand)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {watermarkedUrl ? (
                      <img
                        src={watermarkedUrl}
                        alt="Portrait"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 28 }}>🎨</span>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--earth)",
                          }}
                        >
                          {PRODUCT_LABELS[order.product_type] || order.product_type}
                          {order.size && (
                            <span style={{ color: "var(--earth-light)", fontWeight: 400 }}>
                              {" "}
                              ({order.size})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--earth-light)" }}>
                          {STYLE_LABELS[order.style] || order.style}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 50,
                          background: status.bg,
                          color: status.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        fontSize: 12,
                        color: "var(--earth-light)",
                        marginBottom: 8,
                      }}
                    >
                      <span>{formatDate(order.created_at)}</span>
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: "var(--earth)" }}>
                        {formatPrice(order.price_cents)}
                      </span>
                    </div>

                    {order.tracking_code && (
                      <div style={{ fontSize: 12, color: "var(--earth-light)", marginBottom: 8 }}>
                        Rastreio:{" "}
                        <span style={{ fontFamily: "monospace", color: "var(--earth)" }}>
                          {order.tracking_code}
                        </span>
                      </div>
                    )}

                    {canDownload && (
                      <button
                        onClick={() => handleDownload(order.order_id)}
                        style={{
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          background: "rgba(193,127,89,0.15)",
                          color: "var(--terracotta)",
                          border: "none",
                          borderRadius: 50,
                          cursor: "pointer",
                          fontFamily: "var(--font-nunito), sans-serif",
                        }}
                      >
                        Download HD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
