"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Need to use state because user updates might take time to reflect in context or we want immediate feedback
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileInputRef] = useState(useRef<HTMLInputElement>(null));

  // Initialize state when user loads
  useState(() => {
    if (user) {
        setProfilePic(user.profilePicture || null);
        setName(user.name);
    }
  });

  if (loading) return <div style={{textAlign:"center", padding: 40}}>Loading...</div>;
  if (!user) {
      router.push("/login");
      return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("Image size should be less than 2MB");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
  };

  const handleSave = async () => {
      setUploading(true);
      try {
          const res = await fetch("/api/auth/me", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, profilePicture: profilePic })
          });
          
          if (res.ok) {
              alert("Profile updated! Please refresh to see changes.");
              window.location.reload(); 
          } else {
              alert("Failed to update profile");
          }
      } catch (error) {
          console.error(error);
          alert("Error updating profile");
      } finally {
          setUploading(false);
      }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <div className="animate-in" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>👤 Your Profile</h1>
        </div>

        <div className="glass-card animate-in" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Profile Picture Section */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div 
                    style={{ 
                        width: 120, height: 120, borderRadius: "50%", 
                        background: "var(--card-bg)", border: "2px solid var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", position: "relative"
                    }}
                >
                    {profilePic || user.profilePicture ? (
                        <img 
                            src={profilePic || user.profilePicture || ""} 
                            alt="Profile" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                    ) : (
                        <span style={{ fontSize: 40 }}>👤</span>
                    )}
                </div>
                
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ display: "none" }} 
                    id="profile-upload"
                />
                <label 
                    htmlFor="profile-upload" 
                    className="btn-ghost"
                    style={{ cursor: "pointer", fontSize: 13, border: "1px solid var(--card-border)" }}
                >
                    Change Picture
                </label>
            </div>

            {/* Info Fields */}
            <div style={{ display: "grid", gap: 16 }}>
                <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Full Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="input-field"
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Email</label>
                    <input type="email" value={user.email} disabled className="input-field" style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Role</label>
                        <div className="input-field" style={{ background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center" }}>
                            {user.role.toUpperCase()}
                        </div>
                    </div>
                    {user.rollNumber && (
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Roll Number</label>
                            <div className="input-field" style={{ background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center" }}>
                                {user.rollNumber}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button 
                    onClick={handleSave} 
                    className="btn-primary" 
                    disabled={uploading}
                    style={{ minWidth: 120 }}
                >
                    {uploading ? "Saving..." : "Save Changes"}
                </button>
            </div>

        </div>
    </div>
  );
}
