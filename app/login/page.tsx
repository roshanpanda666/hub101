"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
      <div className="animate-in" style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">Welcome Back</span>
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Sign in to your Campus Hub account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card animate-in"
        style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, animationDelay: "0.1s" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Email</label>
          <input type="email" className="input-field" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Password</label>
          <input type="password" className="input-field" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "14px 32px", fontSize: 16, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Register</Link>
        </p>
      </form>
    </div>
  );
}
