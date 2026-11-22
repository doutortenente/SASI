// Moldura do app: menu lateral do design à esquerda e a tela à direita.
import "./comando-uti.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { Menu } from "@/components/Menu";

export const metadata: Metadata = { title: "Comando UTI", description: "Folha de plantão da UTI 2" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// O tema é claro por padrão, qualquer que seja o do aparelho. Só vira escuro se o médico tiver escolhido "Escuro" no menu
// (guardado no aparelho, chave "tema"). O script roda antes da primeira pintura, então a página não pisca o tema errado.
const TEMA = `(function(){var t="claro";try{if(localStorage.getItem("tema")==="escuro")t="escuro"}catch(e){}document.documentElement.dataset.theme=t})();`;

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
