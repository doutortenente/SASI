// Moldura do app: menu lateral do design à esquerda e a tela à direita.
import "@/styles/comando-uti.css";
import "@/styles/app.css";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { Menu } from "@/components/Menu";

export const metadata: Metadata = { title: "Comando UTI", description: "Folha de plantão da UTI 2" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// O tema (claro ou escuro) segue o do aparelho e é aplicado antes da primeira pintura.
const TEMA = `(function(){try{var m=matchMedia("(prefers-color-scheme: dark)");var p=function(){document.documentElement.dataset.theme=m.matches?"escuro":"claro"};p();m.addEventListener("change",p)}catch(e){}})();`;

export default function Moldura({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="ds">
        <script dangerouslySetInnerHTML={{ __html: TEMA }} />
        <div className="ds-app">
          <Suspense fallback={<aside className="ds-menu" />}><Menu /></Suspense>
          <div className="ds-principal">{children}</div>
        </div>
      </body>
    </html>
  );
}
