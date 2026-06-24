---
title: delta - 08 - README.md
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/Fase Delta/delta - 08 - README.md.docx
ingested: 2026-06-24
kind: docx
---
# 🪖 Edge Function: ocr-ingest

Endpoint HTTP que recebe o payload sasi-ocr-ingest/v1 do Claude/Gemini e grava em pacientes + evolucoes + eventos_clinicos no Supabase do SASI.

## 📐 Estrutura de pastas esperada no repo

comando-uti-alpha/

├── supabase/

│   ├── schema.sql

│   └── functions/

│       └── ocr-ingest/

│           ├── index.ts     ← este arquivo

│           └── README.md    ← você está aqui



## 🚀 Deploy

## Pré-requisitos

Supabase CLI instalada (brew install supabase/tap/supabase)

Autenticado (supabase login)

Link pro projeto (supabase link --project-ref idswehsvvqczzkiatuzu)

## Comando

supabase functions deploy ocr-ingest --project-ref idswehsvvqczzkiatuzu

## Variáveis de ambiente

Já vem do projeto (não precisa setar):

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY (NÃO use — mantemos RLS honesta)

## 🧪 Teste com cURL

curl -X POST \

https://idswehsvvqczzkiatuzu.supabase.co/functions/v1/ocr-ingest \

-H "Authorization: Bearer sb_publishable_9DVsZExR5QOIowCbpirhyw_dRuEVHsy" \

-H "apikey: sb_publishable_9DVsZExR5QOIowCbpirhyw_dRuEVHsy" \

-H "Content-Type: application/json" \

-d @../sasi-ingest-export/assets/payload-example.json

## Resposta esperada (200 OK)

{

"ok": true,

"paciente_id": "uuid-do-paciente",

"evolucao_id": "uuid-da-evolucao-ou-null",

"eventos_inseridos": 15,

"warnings": [

"Plaquetas 180 sem unidade explícita — assumido ×10³/µL"

],

"requires_review_ids": ["uuid-evento-plaq"]

}



## 🔒 Segurança

RLS: a function usa o JWT do usuário (header Authorization). O auth.uid() nas policies do Supabase filtra tudo pelo médico autenticado. Não usa service_role.

Validação: schema check + UTI allowlist (UTI2, UTI3, UTI4).

Sem PII no log: erros logam apenas mensagens genéricas; nunca nomes ou valores clínicos.

CORS: * temporário pro MVP. Apertar pra domínios conhecidos antes de deploy em produção.

## 🧠 Modo Nerd — Decisões de design

Por que não usa service_role: usar a chave de serviço quebra RLS. Cada Edge Function que escreve com service_role é uma porta pelos fundos que pode ser explorada. LGPD artigo 46 + princípio de mínimo privilégio exigem que o caminho de ingest respeite as mesmas policies que o frontend.

Por que inserção atômica parcial e não transação: Supabase REST (PostgREST) não expõe transações multi-tabela na API pública. Se insertEvolucao falha depois de resolvePaciente ter criado paciente novo → registro órfão. Mitigação: verificar se paciente existe ANTES de criar; se a criação é necessária, criar primeiro e, se qualquer passo subsequente falhar, deixar o paciente criado (o frontend pode completar ou apagar depois). Tradeoff aceito pra não complicar o MVP.

Por que fonte hardcoded claude_ocr: a Edge Function só é chamada por este pipeline. Se um dia outro pipeline existir (AppSheet legado, import manual), criar outra function (ou parametrizar este campo). Não aceitar fonte do payload evita spoofing.

Por que return requires_review_ids explícito: o frontend pode mostrar badge amarelo nos eventos que precisam de review. Estruturado no response, fácil de consumir. Evita o frontend ter que re-fetchar tudo pra saber o que precisa atenção.

## 🐛 Troubleshooting

## ⚔️ Próximos passos

Testes: criar __tests__/ocr-ingest.test.ts com Deno test para cada caso do troubleshooting.

Rate limit: middleware pra limitar 60 req/min por usuário (prevenir spam de OCR).

Audit trail: segunda function ocr-ingest-history que guarda o payload cru em ingest_audit_log pra reconstrução forense.

Delta detection: se evento chega com tipo='sofa_total' e é diferente do anterior em >2 pontos → dispara alerts_log (BUG do Sepsis-3, handoff item FASE DELTA).
