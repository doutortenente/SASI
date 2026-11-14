'use client';
// A v1.0 era um app só de navegador (lê tema/modo do localStorage ao montar).
// A moldura monta só no cliente, como no Vite, para não divergir do servidor.
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const Shell = dynamic(() => import('./Shell'), { ssr: false });

export default function ShellClient({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
