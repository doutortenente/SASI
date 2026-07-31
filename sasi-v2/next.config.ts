import type { NextConfig } from "next";

// ============================================================================
// Cabecalhos de seguranca — o app mostra dado REAL de paciente.
//  - X-Frame-Options DENY: ninguem embute o SASI num iframe (clickjacking:
//    uma tela transparente por cima da faixa de alergia capturando cliques).
//  - nosniff / Referrer-Policy / Permissions-Policy: higiene padrao de PHI.
//  - HSTS: so HTTPS depois da primeira visita.
//  - poweredByHeader off: nao anunciar a tecnologia num host com dado clinico.
// CSP (Content-Security-Policy) ficou de fora POR ORA: os componentes injetam
// <style> inline (19 pontos) e ha 1 <script> inline do tema — CSP estrita exige
// nonce em todos; fazer errado = tela branca. Registrado como debito.
// ============================================================================
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
