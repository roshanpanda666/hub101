"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store admin role/token if needed in local context or rely on cookie
      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div className="glass-card" style={{ padding: 40, width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>🛡️ Admin Access</h1>
        
        {error && (
            <div style={{ padding: 10, background: "rgba(220, 38, 38, 0.2)", color: "#f87171", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "#a1a1aa" }}>Admin Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "#a1a1aa" }}>Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
            Enter Panel
          </button>
        </form>
      </div>
    </div>
  );
}
