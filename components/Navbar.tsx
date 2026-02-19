"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/browse", label: "Browse", icon: "📚" },
  { href: "/routine", label: "Routine", icon: "📅" },
  { href: "/exams", label: "Exams", icon: "📝" },
  { href: "/upload", label: "Upload", icon: "☁️" },
  { href: "/add-routine", label: "Add Routine", icon: "➕" },
  { href: "/latest-info", label: "Latest Info", icon: "📢" },
  { href: "/admin/login", label: "Admin", icon: "⚙️" },
  { href: "/about", label: "About", icon: "👨‍💻" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [identity, setIdentity] = useState({ name: "CPGS Hub", logoUrl: "/logo.png" });

  useEffect(() => {
    fetch("/api/admin/config?key=site_identity")
      .then(res => res.json())
      .then(data => {
        if (data.value) {
            const parsed = JSON.parse(data.value);
            setIdentity({
                name: parsed.name || "CPGS Hub",
                logoUrl: parsed.logoUrl || "/logo.png"
            });
        }
      })
      .catch(err => console.error("Failed to fetch identity", err));
  }, []);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--nav-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--card-border)", transition: "background 0.3s ease" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ width: 45, height: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <img src={identity.logoUrl} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
          <span className="gradient-text" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>{identity.name}</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link" style={{ padding: "8px 12px", borderRadius: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 5 }}>
              <span>{link.icon}</span>{link.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{ background: "transparent", border: "1px solid var(--card-border)", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 18, marginLeft: 4, transition: "all 0.2s ease" }} aria-label="Toggle theme" title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--accent-light)" }}>
                  {user.profilePicture ? (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--card-border)" }}>
                          <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                  ) : (
                      <span style={{ fontSize: 20 }}>👤</span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
              </Link>
              <button onClick={logout} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Logout</button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px", marginLeft: 8 }}>Sign In</Link>
          )}
        </div>

        {/* Hamburger */}
        <div className="nav-hamburger" style={{ display: "none" }}>
          <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, marginRight: 8 }} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, color: "var(--foreground)", fontSize: 24 }} aria-label="Toggle menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="nav-mobile" style={{ padding: "8px 24px 16px", display: "flex", flexDirection: "column", gap: 2, background: "var(--nav-bg)", borderBottom: "1px solid var(--card-border)" }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ padding: "12px 16px", borderRadius: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 15, display: "flex", alignItems: "center", gap: 10 }}>
              <span>{link.icon}</span>{link.label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--card-border)", marginTop: 8, paddingTop: 12 }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ fontSize: 14, color: "var(--accent-light)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                    {user.profilePicture ? (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden" }}>
                            <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    ) : (
                        <span>👤</span>
                    )}
                    {user.name}
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>Logout</button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textDecoration: "none", display: "block", textAlign: "center", margin: "0 16px", padding: "12px" }}>Sign In</Link>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link:hover {
            background: rgba(108,99,255,0.12) !important;
            color: var(--accent-light) !important;
        }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; align-items: center; }
        }
      `}</style>
    </nav>
  );
}
