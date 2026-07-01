// ============================================================================
// SASI · exportPDF — gera PDF "Passagem de Turno" (A4 paisagem).
// Usa jspdf + jspdf-autotable. Identidade BAYES.OPS adaptada a papel:
// faixa de marca INK + accent âmbar, tabela zebrada sem grade, badge de
// gravidade colorido, números em fonte mono, cabeçalho/rodapé em toda página.
// ============================================================================
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardRow } from './supabaseClient';
import { severityLabel } from './severity';

// ── Paleta (RGB, calibrada para leitura em papel — não é a paleta OLED crua) ──
const INK: [number, number, number] = [17, 24, 37];        // faixa/cabeçalho + texto
const PANEL: [number, number, number] = [243, 246, 250];   // zebra clara
const HAIRLINE: [number, number, number] = [214, 222, 231];
const AMBER: [number, number, number] = [245, 158, 11];    // accent (produção/ação)
const TEAL: [number, number, number] = [13, 148, 136];     // melhora (Δ negativo)
const RED: [number, number, number] = [220, 38, 38];       // crítico/piora
const MUTED: [number, number, number] = [126, 140, 158];

// gravidade db → cor de badge (fundo + texto)
const SEV_BADGE: Record<string, { fill: [number, number, number]; text: [number, number, number] }> = {
  critico: { fill: [220, 38, 38], text: [255, 255, 255] },
  grave: { fill: [249, 115, 22], text: [255, 255, 255] },
  moderado: { fill: [245, 158, 11], text: INK },
  estavel: { fill: [16, 150, 110], text: [255, 255, 255] },
  obito: { fill: [71, 85, 105], text: [255, 255, 255] },
};

const M = 10; // margem lateral (mm)
const HEADER_H = 18; // altura da faixa de marca (mm)

function getPlantao(): string {
  const h = new Date().getHours();
  if (h >= 7 && h < 13) return 'MANHÃ';
  if (h >= 13 && h < 19) return 'TARDE';
  return 'NOITE';
}

function truncate(s: string | null | undefined, max: number): string {
  if (!s) return '—';
  return s.length > max ? s.slice(0, max) + '…' : s;
}

/**
 * As fontes nativas do jsPDF (helvetica/courier) só cobrem WinAnsi/Latin-1.
 * Glifos clínicos comuns (▸ ⚑ → ≥ Δ …) viram lixo se não forem substituídos.
 * Acentos pt-BR (á é ç ã õ) ficam intactos (estão em Latin-1).
 */
function pdfText(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/[▸►‣▹]\s?/g, '') // marcador de linha (a coluna já rotula)
    .replace(/[⚑⚐]\s?/g, '')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/[≈∼]/g, '~')
    .replace(/Δ/g, 'd')
    .replace(/[^\x00-\xFF]/g, '') // remove qualquer glifo fora do Latin-1 restante
    .trim();
}

interface HeaderMeta {
  linhaDireita1: string; // data · hora · plantão
  linhaDireita2: string; // N pacientes · N críticos · responsável
}

/** Faixa de marca no topo — desenhada em TODA página (via didDrawPage). */
function drawBrandHeader(doc: jsPDF, meta: HeaderMeta) {
  const pageW = doc.internal.pageSize.getWidth();
  // faixa escura
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, HEADER_H, 'F');
  // barra accent âmbar (produção/ação)
  doc.setFillColor(...AMBER);
  doc.rect(0, HEADER_H, pageW, 1.2, 'F');
  // reticle de canto (assinatura HUD) — discreto, âmbar
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.5);
  doc.line(M - 4, 4, M - 4, 9); // canto esq. vertical
  doc.line(M - 4, 4, M + 1, 4); // canto esq. horizontal
  // título
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SASI // PASSAGEM DE TURNO', M, 9, { charSpace: 0.6 });
  // metadados à direita (branco apagado)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(184, 194, 208);
  doc.text(meta.linhaDireita1, pageW - M, 6.5, { align: 'right' });
  doc.text(meta.linhaDireita2, pageW - M, 12.5, { align: 'right' });
}

/** Rodapé em TODA página. */
function drawFooter(doc: jsPDF, pageNumber: number, version: string, n: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.line(M, pageH - 9, pageW - M, pageH - 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`SASI ${version} · ${n} pacientes · LGPD art. 46 · Documento interno`, M, pageH - 5);
  doc.text(`Pág ${pageNumber}`, pageW - M, pageH - 5, { align: 'right' });
}

function nowMeta() {
  const now = new Date();
  return {
    now,
    plantao: getPlantao(),
    dateStr: now.toLocaleDateString('pt-BR'),
    timeStr: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    ts: now.toISOString().replace(/[:.]/g, '').slice(0, 13),
  };
}

function countCriticos(patients: DashboardRow[]): number {
  return patients.filter((p) => p.gravidade === 'critico' || p.gravidade === 'obito').length;
}

// ── v1: tabela densa 11 colunas (botão PDF do Dashboard/TopBar) ──────────────
export function buildPassagemTurnoDoc(
  patients: DashboardRow[],
  userEmail?: string,
): { doc: jsPDF; filename: string } {
  const { plantao, dateStr, timeStr, ts } = nowMeta();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const meta: HeaderMeta = {
    linhaDireita1: `${dateStr} · ${timeStr} · PLANTÃO ${plantao}`,
    linhaDireita2: `${patients.length} pacientes · ${countCriticos(patients)} críticos${userEmail ? ` · ${userEmail}` : ''}`,
  };

  const head = [['UTI', 'Leito', 'Nome', 'SOFA', '24h', 'Gravidade', 'DVA', 'Sed', 'Pend', 'Dias', 'HD']];
  const body = patients.map((p) => {
    const delta = p.delta_sofa_24h ?? 0;
    const deltaStr = delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '—';
    const dvaCount = Array.isArray(p.dvas) ? p.dvas.length : 0;
    const sedCount = Array.isArray(p.sedativos) ? p.sedativos.length : 0;
    return [
      p.uti,
      p.leito,
      pdfText(truncate(p.nome, 30)),
      p.sofa_total ?? '—',
      deltaStr,
      p.gravidade, // convertido em badge no didParseCell
      dvaCount > 0 ? `${dvaCount}` : '—',
      sedCount > 0 ? `${sedCount}` : '—',
      p.pendencias_abertas > 0 ? String(p.pendencias_abertas) : '—',
      `D${p.dias_internacao}`,
      pdfText(truncate(p.hd, 80)),
    ];
  });

  autoTable(doc, {
    startY: HEADER_H + 5,
    margin: { top: HEADER_H + 5, left: M, right: M, bottom: 13 },
    head,
    body,
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      textColor: INK,
      lineWidth: 0,
      valign: 'middle',
    },
    headStyles: {
      fillColor: INK,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.4,
    },
    alternateRowStyles: { fillColor: PANEL },
    columnStyles: {
      0: { cellWidth: 13 },
      1: { cellWidth: 13 },
      2: { cellWidth: 36 },
      3: { cellWidth: 13, halign: 'center', font: 'courier', fontStyle: 'bold' },
      4: { cellWidth: 10, halign: 'center', font: 'courier' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 12, halign: 'center', font: 'courier' },
      7: { cellWidth: 11, halign: 'center', font: 'courier' },
      8: { cellWidth: 13, halign: 'center', font: 'courier' },
      9: { cellWidth: 13, halign: 'center', font: 'courier' },
      10: { cellWidth: 'auto' },
    },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const col = data.column.index;
      // Badge de gravidade
      if (col === 5) {
        const raw = String(data.cell.raw);
        const badge = SEV_BADGE[raw] ?? SEV_BADGE.estavel;
        data.cell.styles.fillColor = badge.fill;
        data.cell.styles.textColor = badge.text;
        data.cell.styles.fontStyle = 'bold';
        data.cell.text = [severityLabel(raw).toUpperCase()];
      }
      // SOFA alto
      if (col === 3) {
        const v = Number(data.cell.raw);
        if (v >= 11) data.cell.styles.textColor = RED;
        else if (v >= 7) data.cell.styles.textColor = AMBER;
      }
      // Δ SOFA — piora vermelho, melhora teal
      if (col === 4) {
        const raw = String(data.cell.raw);
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = RED;
          data.cell.styles.fontStyle = 'bold';
        } else if (raw.startsWith('-')) {
          data.cell.styles.textColor = TEAL;
        }
      }
    },
    didDrawPage(data) {
      drawBrandHeader(doc, meta);
      drawFooter(doc, data.pageNumber, 'v1.1', patients.length);
    },
  });

  return { doc, filename: `SASI_passagem_${ts}.pdf` };
}

// ── v2: passagem 3-linhas com L2 (muda-conduta) e L3 (pendências) ────────────
export function buildPassagemTurno3LinhasDoc(
  patients: DashboardRow[],
  blocks: Array<{ linha1: string; linha2: string; linha3: string }>,
  userEmail?: string,
): { doc: jsPDF; filename: string } {
  const { plantao, dateStr, timeStr, ts } = nowMeta();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const meta: HeaderMeta = {
    linhaDireita1: `${dateStr} · ${timeStr} · PLANTÃO ${plantao}`,
    linhaDireita2: `${patients.length} pacientes · ${countCriticos(patients)} críticos${userEmail ? ` · ${userEmail}` : ''}`,
  };

  const head = [['UTI', 'Lt', 'Nome', 'SOFA', '24h', 'Gravidade', 'D', 'Muda-conduta (L2)', 'Pendências / Riscos (L3)']];
  const body = patients.map((p, i) => {
    const block = blocks[i];
    const delta = p.delta_sofa_24h ?? 0;
    const deltaStr = delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '—';
    return [
      p.uti,
      p.leito,
      pdfText(truncate(p.nome, 26)),
      p.sofa_total ?? '—',
      deltaStr,
      p.gravidade,
      `D${p.dias_internacao}`,
      pdfText(block?.linha2 ?? ''),
      pdfText(block?.linha3 ?? ''),
    ];
  });

  autoTable(doc, {
    startY: HEADER_H + 5,
    margin: { top: HEADER_H + 5, left: M, right: M, bottom: 13 },
    head,
    body,
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: INK,
      lineWidth: 0,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: INK,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2,
    },
    alternateRowStyles: { fillColor: PANEL },
    columnStyles: {
      0: { cellWidth: 11 },
      1: { cellWidth: 8, halign: 'center' },
      2: { cellWidth: 32 },
      3: { cellWidth: 13, halign: 'center', font: 'courier', fontStyle: 'bold' },
      4: { cellWidth: 10, halign: 'center', font: 'courier' },
      5: { cellWidth: 19, halign: 'center' },
      6: { cellWidth: 9, halign: 'center', font: 'courier' },
      7: { cellWidth: 86 },
      8: { cellWidth: 'auto' },
    },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const col = data.column.index;
      if (col === 5) {
        const raw = String(data.cell.raw);
        const badge = SEV_BADGE[raw] ?? SEV_BADGE.estavel;
        data.cell.styles.fillColor = badge.fill;
        data.cell.styles.textColor = badge.text;
        data.cell.styles.fontStyle = 'bold';
        data.cell.text = [severityLabel(raw).toUpperCase()];
      }
      if (col === 3) {
        const v = Number(data.cell.raw);
        if (v >= 11) data.cell.styles.textColor = RED;
        else if (v >= 7) data.cell.styles.textColor = AMBER;
      }
      if (col === 4) {
        const raw = String(data.cell.raw);
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = RED;
          data.cell.styles.fontStyle = 'bold';
        } else if (raw.startsWith('-')) {
          data.cell.styles.textColor = TEAL;
        }
      }
    },
    didDrawPage(data) {
      drawBrandHeader(doc, meta);
      drawFooter(doc, data.pageNumber, 'v2.1', patients.length);
    },
  });

  return { doc, filename: `SASI_passagem_${ts}.pdf` };
}

// ── APIs públicas (assinaturas inalteradas — usadas por Dashboard e PassagemTurno) ──
export function exportPassagemTurno(patients: DashboardRow[], userEmail?: string) {
  const { doc, filename } = buildPassagemTurnoDoc(patients, userEmail);
  doc.save(filename);
}

export function exportPassagemTurno3Linhas(
  patients: DashboardRow[],
  blocks: Array<{ linha1: string; linha2: string; linha3: string }>,
  userEmail?: string,
) {
  const { doc, filename } = buildPassagemTurno3LinhasDoc(patients, blocks, userEmail);
  doc.save(filename);
}
