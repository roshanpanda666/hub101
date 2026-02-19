"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setIsStudent] = useState(true);
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (isStudent && !rollNumber.trim()) {
        setError("Roll number is required for students");
        return;
    }

    setLoading(true);
    const result = await register(name, email, password, isStudent ? rollNumber : undefined);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
      <div className="animate-in" style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">Join Campus Hub</span>
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Create your account to start sharing</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card animate-in"
        style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, animationDelay: "0.1s" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>I am a...</label>
          <div style={{ display: "flex", gap: 12 }}>
            <button
                type="button"
                onClick={() => setIsStudent(true)}
                style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: isStudent ? "2px solid var(--accent)" : "1px solid var(--card-border)",
                    background: isStudent ? "rgba(108, 99, 255, 0.1)" : "transparent",
                    color: isStudent ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}
            >
                Student
            </button>
            <button
                type="button"
                onClick={() => setIsStudent(false)}
                style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: !isStudent ? "2px solid var(--accent)" : "1px solid var(--card-border)",
                    background: !isStudent ? "rgba(108, 99, 255, 0.1)" : "transparent",
                    color: !isStudent ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}
            >
                Teacher / Staff
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Full Name</label>
          <input type="text" className="input-field" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Email</label>
          <input type="email" className="input-field" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        {isStudent && (
            <div className="animate-in" style={{ animationDuration: "0.3s" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Roll Number <span style={{color:"var(--danger)"}}>*</span></label>
                <input type="text" className="input-field" placeholder="e.g. 210101001" required={isStudent} value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
            </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Password</label>
          <input type="password" className="input-field" placeholder="Min 6 characters" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "14px 32px", fontSize: 16, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
        </p>
      </form>
    </div>
  );
}
