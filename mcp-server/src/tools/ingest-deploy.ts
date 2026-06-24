import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getDB, handleDBError } from "../db.js";

const UTI_ENUM = z.enum(["UTI2", "UTI3", "UTI4"]);
const PLANTAO_ENUM = z.enum(["manha", "tarde", "noite", "plantao_24h"]);

const EventoSchema = z.object({
  ts: z.string(),
  tipo: z.string(),
  valor_num: z.number().nullable().optional(),
  valor_json: z.record(z.unknown()).optional(),
  unidade: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  source_text: z.string().nullable().optional(),
  requires_review: z.boolean().optional(),
});

const PayloadSchema = z.object({
  $schema: z.literal("sasi-ocr-ingest/v1"),
  extracted_at: z.string(),
  source: z.object({
    type: z.string().optional(),
    fonte: z.string(),
    confidence_overall: z.number().optional(),
    warnings: z.array(z.string()).optional(),
  }),
  target: z.object({
    uti: UTI_ENUM,
    leito: z.string(),
    paciente_id: z.string().uuid().nullable().optional(),
  }),
  paciente_upsert: z.record(z.unknown()).nullable().optional(),
  evolucao_snapshot: z.record(z.unknown()).nullable().optional(),
  eventos_clinicos: z.array(EventoSchema).optional(),
}).strict();

type PayloadV1 = z.infer<typeof PayloadSchema>;

async function audit(
  paciente_id: string | null,
  payload: PayloadV1,
  response: unknown,
  eventos_ids: string[],
  warnings: string[],
  ok: boolean,
  error_msg: string | null,
): Promise<void> {
  const user_id = process.env.SASI_OPERATOR_USER_ID ?? null;
  await getDB().from("ingest_audit_log").insert({
    user_id,
    paciente_id,
    source_type: payload.source?.type ?? null,
    fonte: payload.source?.fonte ?? null,
    payload_raw: payload as unknown as Record<string, unknown>,
    response: response as Record<string, unknown>,
    eventos_ids,
    warnings,
    ok,
    error_msg,
  });
}

export function registerIngestDeployTools(server: McpServer): void {
  server.registerTool(
    "sasi_deploy_ingest",
    {
      title: "SASI — Deploy Ingest (bulk)",
      description: `Persiste payload sasi-ocr-ingest/v1 completo no Supabase (paciente + evolução + eventos_clinicos).

Use após a skill sasi-ingest-export gerar JSON validado. Equivalente operacional ao Edge Function ocr-ingest, via service role MCP.

Args:
  - payload (object): JSON completo com $schema "sasi-ocr-ingest/v1"

Retorna: paciente_id, evolucao_id, eventos_inseridos, warnings.`,
      inputSchema: z.object({
        payload: PayloadSchema,
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ payload }) => {
      const warnings: string[] = [...(payload.source?.warnings ?? [])];
      const eventos_ids: string[] = [];
      const user_id = process.env.SASI_OPERATOR_USER_ID ?? null;

      try {
        let paciente_id: string | null = payload.target.paciente_id ?? null;

        if (!paciente_id) {
          const { data: existing, error: pacErr } = await getDB()
            .from("pacientes")
            .select("id, user_id")
            .eq("uti", payload.target.uti)
            .eq("leito", payload.target.leito)
            .eq("status_leito", "ativo")
            .maybeSingle();

          if (pacErr) {
            await audit(null, payload, null, [], warnings, false, `paciente_lookup: ${pacErr.message}`);
            return { content: [{ type: "text", text: handleDBError(pacErr) }] };
          }

          if (existing?.id) {
            paciente_id = existing.id;
          } else if (payload.paciente_upsert) {
            const upsertBody = {
              ...payload.paciente_upsert,
              uti: payload.target.uti,
              leito: payload.target.leito,
              user_id,
              status_leito: "ativo",
            };
            const { data: created, error: insErr } = await getDB()
              .from("pacientes")
              .insert(upsertBody)
              .select("id")
              .single();
            if (insErr || !created) {
              await audit(null, payload, null, [], warnings, false, `paciente_upsert: ${insErr?.message}`);
              return { content: [{ type: "text", text: handleDBError(insErr ?? "paciente_upsert_failed") }] };
            }
            paciente_id = created.id;
            warnings.push(`paciente criado via upsert: ${paciente_id}`);
          } else {
            await audit(null, payload, null, [], warnings, false, "paciente_nao_encontrado");
            return {
              content: [{
                type: "text",
                text: "Paciente não encontrado para (uti, leito). Envie target.paciente_id ou paciente_upsert.",
              }],
            };
          }
        }

        let evolucao_id: string | null = null;
        if (payload.evolucao_snapshot) {
          const snap = payload.evolucao_snapshot;
          const plantaoRaw = snap.plantao as string | undefined;
          const plantao = PLANTAO_ENUM.safeParse(plantaoRaw)?.data ?? "manha";

          const evolucaoBody: Record<string, unknown> = {
            paciente_id,
            user_id,
            data_evolucao: snap.data_evolucao ?? payload.extracted_at,
            plantao,
            neuro: snap.neuro ?? {},
            resp: snap.resp ?? {},
            hemo: snap.hemo ?? {},
            tgi: snap.tgi ?? {},
            renal: snap.renal ?? {},
            hemato: snap.hemato ?? {},
            infecto: snap.infecto ?? {},
            dvas: snap.dvas ?? [],
            sedativos: snap.sedativos ?? [],
            impressao: snap.impressao ?? [],
            conduta: snap.conduta ?? [],
            problemas_ativos: snap.problemas_ativos ?? [],
            condutas_sistemas: snap.condutas_sistemas ?? [],
            riscos: snap.riscos ?? [],
            sofa_snapshot: snap.sofa_snapshot ?? null,
            sofa_total: snap.sofa_total ?? null,
          };

          const { data: evol, error: evolErr } = await getDB()
            .from("evolucoes")
            .insert(evolucaoBody)
            .select("id")
            .single();

          if (evolErr || !evol) {
            await audit(paciente_id, payload, null, [], warnings, false, `evolucao_insert: ${evolErr?.message}`);
            return { content: [{ type: "text", text: handleDBError(evolErr ?? "evolucao_insert_failed") }] };
          }
          evolucao_id = evol.id;
        }

        if (payload.eventos_clinicos?.length) {
          const fonte = payload.source.fonte === "claude_ocr" ? "claude_ocr"
            : payload.source.fonte === "gemini_ocr" ? "gemini_ocr"
            : "api_import";

          const eventosBody = payload.eventos_clinicos.map((ev) => ({
            paciente_id,
            evolucao_id,
            user_id,
            ts: ev.ts,
            tipo: ev.tipo,
            valor_num: ev.valor_num ?? null,
            valor_json: ev.valor_json ?? null,
            unidade: ev.unidade ?? null,
            fonte,
            confidence: ev.confidence ?? null,
            source_text: ev.source_text ?? null,
            requires_review: ev.requires_review ?? false,
          }));

          const { data: inserted, error: evErr } = await getDB()
            .from("eventos_clinicos")
            .insert(eventosBody)
            .select("id, tipo, requires_review");

          if (evErr) {
            await audit(paciente_id, payload, null, [], warnings, false, `eventos_insert: ${evErr.message}`);
            return { content: [{ type: "text", text: handleDBError(evErr) }] };
          }
          for (const r of inserted ?? []) eventos_ids.push(r.id);
        }

        const response = {
          ok: true,
          paciente_id,
          evolucao_id,
          eventos_inseridos: eventos_ids.length,
          eventos_ids,
          requires_review_count: (payload.eventos_clinicos ?? []).filter((e) => e.requires_review).length,
          warnings,
        };

        await audit(paciente_id, payload, response, eventos_ids, warnings, true, null);

        return {
          content: [{
            type: "text",
            text: [
              "✅ Deploy ingest concluído",
              `paciente_id: ${paciente_id}`,
              `evolucao_id: ${evolucao_id ?? "—"}`,
              `eventos: ${eventos_ids.length}`,
              `requires_review: ${response.requires_review_count}`,
              warnings.length ? `warnings: ${warnings.join(" | ")}` : "",
            ].filter(Boolean).join("\n"),
          }],
          structuredContent: response,
        };
      } catch (e) {
        return { content: [{ type: "text", text: handleDBError(e) }] };
      }
    },
  );
}