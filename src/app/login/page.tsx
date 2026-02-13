"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/minha-conta");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--sand)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link
          href="/chat"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 40,
            textDecoration: "none",
            color: "var(--earth)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            fotofocinho
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.3em",
              color: "var(--earth-light)",
              marginTop: 2,
            }}
          >
            PET PORTRAITS
          </span>
        </Link>

        <div
          style={{
            background: "var(--cream)",
            border: "1px solid var(--sage-light)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 8,
              color: "var(--earth)",
            }}
          >
            Bem-vindo de volta
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--earth-light)",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Entre para acessar seus retratos
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: "var(--earth)",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--sage-light)",
                  background: "white",
                  fontSize: 14,
                  color: "var(--earth)",
                  outline: "none",
                  fontFamily: "var(--font-nunito), sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: "var(--earth)",
                }}
              >
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    borderRadius: 12,
                    border: "1px solid var(--sage-light)",
                    background: "white",
                    fontSize: 14,
                    color: "var(--earth)",
                    outline: "none",
                    fontFamily: "var(--font-nunito), sans-serif",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--earth-light)",
                    padding: 4,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontSize: 14,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="confirm-btn"
              style={{
                width: "100%",
                padding: "14px 24px",
                fontSize: 15,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--earth-light)",
            marginTop: 24,
          }}
        >
          <Link
            href="/chat"
            style={{ color: "var(--earth-light)", textDecoration: "none" }}
          >
            Voltar ao chat
          </Link>
        </p>
      </div>
    </div>
  );
}
