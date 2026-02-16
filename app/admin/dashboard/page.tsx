"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-muted)" }}>
      Redirecting to new Admin Panel...
    </div>
  );
}
