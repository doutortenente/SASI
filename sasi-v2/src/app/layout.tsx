import "@/styles/globals.css";
import type { ReactNode } from "react";
export const metadata = { title: "SASI v2 — Comando UTI", description: "Sistema de Auditoria e Síntese Intensiva" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="pt-BR"><body>{children}</body></html>);
}
