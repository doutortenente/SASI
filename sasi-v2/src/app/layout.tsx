// ============================================================================
// SASI v2 — Layout raiz com a moldura da v1.0 "Comando UTI Alpha"
// (Sidebar + TopBar + rodapé do Dashboard.tsx v1.0, em src/v1/components/Shell).
// ============================================================================
import "@/styles/globals.css";
import type {Metadata, Viewport} from "next";
import type {ReactNode} from "react";
import Shell from "@/v1/components/ShellClient";

export const metadata: Metadata = {
  title: "SASI — Comando UTI Alpha",
  description: "Sistema de Auditoria e Síntese Intensiva",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
    <body className="theme-dark bg-app text-app-text" suppressHydrationWarning>
    <Shell>{children}</Shell>
    </body>
    </html>
  );
}
