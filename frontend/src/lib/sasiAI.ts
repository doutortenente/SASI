// sasiAI.ts — Prompt SASI v2.0 + Grok (xAI API direto) + simulação local
// grok-synthesis (Edge Function) foi removida — chave via VITE_XAI_API_KEY

export interface RawClinicalInput {
  previousEvolution?: string;
  ocrNursingNotes?: string;
  ocrPrescription?: string;
  physicalExamNotes?: string;
  labs?: string;
  currentDvas?: string;
}

export interface SASISynthesisRequest {
  patientContext: string;
  rawData: RawClinicalInput;
  currentSupport?: string;
}

export interface SASIProblema {
  texto: string;
  sistema?: string;
}

export interface SASIConduta {
  sistema: string;
  texto: string;
  meta?: string;
  prazo?: string;
}

export interface SASISynthesisOutput {
  problemasAtivos: SASIProblema[];
  condutasSistemas: SASIConduta[];
  riscos: string[];
  observacoes?: string;
}

export interface PatientContextInput {
  nome?: string;
  idade?: number;
  leito?: string;
  uti?: string;
  hd?: string;
  peso?: number;
  motivoAdmissao?: string;
  antecedentes?: string;
  planoTerapeutico?: string;
  suporteAtual?: string;
}

export const SASI_V2_SYSTEM_PROMPT = `Você é um intensivista especialista no método SASI v2.0 (Ramo C) com ortogonalidade de eixos.

REGRAS OBRIGATÓRIAS:
- Lista problemas ativos de forma objetiva e clínica.
- Toda conduta DEVE ter meta numérica clara quando possível (PAM, diurese ml/kg/h, lactato, etc.).
- Organize condutas por sistemas (Neuro, Cardiovascular, Respiratório, TGI, Renal, Hemato, Infecto).
- Seja objetivo, sucinto e clínico. Nunca invente valores.
- Use o formato JSON estrito solicitado.`;

export function buildStrongSASIPrompt(request: SASISynthesisRequest): string {
  const { patientContext, rawData } = request;

  return `
${SASI_V2_SYSTEM_PROMPT}

**CONTEXTO DO PACIENTE (Patient Summary / HD atual):**
${patientContext}

**DADOS BRUTOS COLETADOS (evolução anterior + folha de enfermagem + prescrição + exame):**
${rawData.previousEvolution ? `--- Evolução Anterior ---\n${rawData.previousEvolution}\n\n` : ''}
${rawData.ocrNursingNotes ? `--- Folhão Enfermagem (Sinais/Balanço/Dieta) ---\n${rawData.ocrNursingNotes}\n\n` : ''}
${rawData.ocrPrescription ? `--- Prescrição Vigente ---\n${rawData.ocrPrescription}\n\n` : ''}
${rawData.physicalExamNotes ? `--- Exame Físico ---\n${rawData.physicalExamNotes}\n\n` : ''}
${rawData.labs ? `--- Laboratório ---\n${rawData.labs}\n\n` : ''}
${rawData.currentDvas ? `--- Suporte Atual ---\n${rawData.currentDvas}\n` : ''}

**TAREFA:**
Gere uma síntese clínica SASI v2.0 de alta qualidade no seguinte formato JSON:

{
  "problemasAtivos": [
    { "texto": "...", "sistema": "hemo|renal|..." }
  ],
  "condutasSistemas": [
    { "sistema": "Cardiovascular", "texto": "...", "meta": "PAM ≥ 65 mmHg", "prazo": "próximas 6h" }
  ],
  "riscos": ["...", "..."],
  "observacoes": "Observações importantes ou atualizações sugeridas para o Patient Summary"
}

Responda **apenas com o JSON válido**.
`;
}

export function simulateSASISynthesis(request: SASISynthesisRequest): SASISynthesisOutput {
  const fullText = [
    request.patientContext,
    request.rawData.previousEvolution,
    request.rawData.ocrNursingNotes,
    request.rawData.physicalExamNotes,
    request.rawData.labs,
  ].filter(Boolean).join('\n').toLowerCase();

  const problemas: SASIProblema[] = [];
  const condutas: SASIConduta[] = [];
  const riscos: string[] = [];

  if (fullText.includes('choque') || fullText.includes('noradrenalina') || fullText.includes('baixo débito') || fullText.includes('inotrópico') || fullText.includes('dobutamina')) {
    problemas.push({ texto: 'Choque cardiogênico / baixo débito', sistema: 'hemo' });
    condutas.push({
      sistema: 'Cardiovascular',
      texto: 'Titular Noradrenalina + Dobutamina conforme perfusão e PAM',
      meta: 'PAM ≥ 65 mmHg + Lactato em queda',
      prazo: 'contínuo',
    });
  }

  if (fullText.includes('ira') || fullText.includes('creatinina') || fullText.includes('cardiorrenal') || (fullText.includes('cr ') && fullText.includes('piora'))) {
    problemas.push({ texto: 'IRA aguda / Síndrome cardiorrenal', sistema: 'renal' });
    condutas.push({
      sistema: 'Renal',
      texto: 'Balanço hídrico negativo agressivo + diurético',
      meta: 'Diurese ≥ 0.5 ml/kg/h + BH negativo',
      prazo: '24h',
    });
  }

  if (fullText.includes('congestão') || fullText.includes('crepitações') || fullText.includes('taquipneia') || fullText.includes('edema pulmonar')) {
    problemas.push({ texto: 'Congestão pulmonar / sobrecarga volêmica', sistema: 'resp' });
    condutas.push({
      sistema: 'Renal/Cardiovascular',
      texto: 'Furosemida + restrição hídrica',
      meta: 'BH < -500 mL/24h',
      prazo: 'próximas 24h',
    });
  }

  if (fullText.includes('leucocitose') || fullText.includes('leuco') || fullText.includes('bast') || fullText.includes('pcr')) {
    problemas.push({ texto: 'Leucocitose ascendente - investigar infecção', sistema: 'infecto' });
    riscos.push('Sepse sobreposta');
  }

  if (fullText.includes('taquicardia') || (fullText.includes('fc') && fullText.includes('piora'))) {
    problemas.push({ texto: 'Taquicardia sustentada', sistema: 'hemo' });
  }

  if (problemas.length === 0) {
    problemas.push({ texto: 'Instabilidade hemodinâmica em avaliação', sistema: 'hemo' });
  }

  if (condutas.length === 0) {
    condutas.push({
      sistema: 'Cardiovascular',
      texto: 'Manter suporte atual e reavaliar',
      meta: 'PAM e perfusão adequadas',
      prazo: 'reavaliação 4-6h',
    });
  }

  if (riscos.length === 0) {
    riscos.push('Piora hemodinâmica', 'Piora renal');
  }

  return {
    problemasAtivos: problemas,
    condutasSistemas: condutas,
    riscos,
    observacoes: 'Gerado por simulação local. Revise com atenção.',
  };
}

export function buildPatientContext(input: PatientContextInput): string {
  const lines = [
    input.nome ? `Paciente: ${input.nome}${input.idade != null ? `, ${input.idade}a` : ''}` : '',
    input.leito && input.uti ? `Leito: ${input.leito} · ${input.uti}` : '',
    input.hd ? `HD: ${input.hd}` : '',
    input.peso != null ? `Peso: ${input.peso} kg` : '',
    input.motivoAdmissao ? `Motivo admissão: ${input.motivoAdmissao}` : '',
    input.antecedentes ? `Antecedentes: ${input.antecedentes}` : '',
    input.planoTerapeutico ? `Plano terapêutico atual: ${input.planoTerapeutico}` : '',
    input.suporteAtual ? `Suporte atual: ${input.suporteAtual}` : '',
  ].filter(Boolean);

  return lines.length > 0 ? lines.join('\n') : 'Paciente em evolução pontual — contexto clínico limitado.';
}

export function getReadyToPastePrompt(request: SASISynthesisRequest): string {
  return buildStrongSASIPrompt(request);
}

const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions';

function getXaiApiKey(): string | undefined {
  const key = import.meta.env.VITE_XAI_API_KEY;
  return typeof key === 'string' && key.trim() ? key.trim() : undefined;
}

function getXaiModel(): string {
  const model = import.meta.env.VITE_XAI_MODEL;
  return typeof model === 'string' && model.trim() ? model.trim() : 'grok-3-mini';
}

export async function generateStructuredSynthesisViaGrok(
  request: SASISynthesisRequest,
): Promise<SASISynthesisOutput> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    throw new Error('VITE_XAI_API_KEY não configurada (frontend/.env ou Netlify)');
  }

  const prompt = buildStrongSASIPrompt(request);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(XAI_CHAT_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getXaiModel(),
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você gera sínteses clínicas SASI v2.0 em JSON estrito. Nunca invente dados clínicos. Responda somente com JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`xAI HTTP ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('xAI resposta vazia');
    }

    return parseSynthesisJson(content);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateStructuredSynthesis(
  request: SASISynthesisRequest,
  options?: { preferGrok?: boolean },
): Promise<{ output: SASISynthesisOutput; source: 'grok' | 'local' }> {
  if (options?.preferGrok !== false) {
    try {
      const output = await generateStructuredSynthesisViaGrok(request);
      return { output, source: 'grok' };
    } catch (err) {
      console.warn('[SASI] Grok indisponível, usando simulação local:', err);
    }
  }

  return { output: simulateSASISynthesis(request), source: 'local' };
}

export function parseSynthesisJson(raw: string): SASISynthesisOutput {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(jsonText) as SASISynthesisOutput;

  if (!Array.isArray(parsed.problemasAtivos) || !Array.isArray(parsed.condutasSistemas)) {
    throw new Error('JSON inválido: problemasAtivos e condutasSistemas são obrigatórios');
  }

  return {
    problemasAtivos: parsed.problemasAtivos.map(p => ({ texto: p.texto, sistema: p.sistema })),
    condutasSistemas: parsed.condutasSistemas,
    riscos: parsed.riscos ?? [],
    observacoes: parsed.observacoes,
  };
}