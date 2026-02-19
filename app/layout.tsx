import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatBubble from "@/components/ChatBubble";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import dbConnect from "@/lib/dbConnect";
import SystemConfig from "@/models/SystemConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPGS Hub | Your Academic Companion",
  description:
    "Access syllabi, exam schedules, PYQs, routines, and an AI-powered academic assistant — all in one place.",
};

async function getThemeConfig() {
  try {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: "theme_config" });
    if (config && config.value) {
      return JSON.parse(config.value);
    }
  } catch (error) {
    console.error("Failed to fetch theme config:", error);
  }
  return null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeConfig = await getThemeConfig();

  let dynamicStyle = "";
  if (themeConfig) {
      dynamicStyle = `
        :root {
            ${Object.entries(themeConfig)
              .filter(([key]) => key.startsWith("--"))
              .map(([key, val]) => `${key}: ${val} !important;`)
              .join("\n")}
        }
      `;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {dynamicStyle && <style dangerouslySetInnerHTML={{ __html: dynamicStyle }} />}
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
            <ChatBubble />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
