export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          ativo: boolean
          comparador: string
          created_at: string
          fonte: string | null
          id: string
          limiar: number
          mensagem: string
          ordem: number
          rotulo: string
          severidade: string
          tipo_evento: string
        }
        Insert: {
          ativo?: boolean
          comparador: string
          created_at?: string
          fonte?: string | null
          id?: string
          limiar: number
          mensagem: string
          ordem?: number
          rotulo: string
          severidade: string
          tipo_evento: string
        }
        Update: {
          ativo?: boolean
          comparador?: string
          created_at?: string
          fonte?: string | null
          id?: string
          limiar?: number
          mensagem?: string
          ordem?: number
          rotulo?: string
          severidade?: string
          tipo_evento?: string
        }
        Relationships: []
      }
      alerts_log: {
        Row: {
          acked: boolean
          acked_at: string | null
          acked_by: string | null
          created_at: string
          evento_id: string | null
          hash_key: string
          id: string
          mensagem: string
          paciente_id: string
          payload: Json | null
          severidade: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          acked?: boolean
          acked_at?: string | null
          acked_by?: string | null
          created_at?: string
          evento_id?: string | null
          hash_key: string
          id?: string
          mensagem: string
          paciente_id: string
          payload?: Json | null
          severidade?: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          acked?: boolean
          acked_at?: string | null
          acked_by?: string | null
          created_at?: string
          evento_id?: string | null
          hash_key?: string
          id?: string
          mensagem?: string
          paciente_id?: string
          payload?: Json | null
          severidade?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_log_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_clinicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_log_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_eventos_pendentes_revisao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      antibiograma: {
        Row: {
          antibiotico: string
          cim: number | null
          created_at: string
          cultura_id: string
          id: string
          resultado: string
        }
        Insert: {
          antibiotico: string
          cim?: number | null
          created_at?: string
          cultura_id: string
          id?: string
          resultado: string
        }
        Update: {
          antibiotico?: string
          cim?: number | null
          created_at?: string
          cultura_id?: string
          id?: string
          resultado?: string
        }
        Relationships: [
          {
            foreignKeyName: "antibiograma_cultura_id_fkey"
            columns: ["cultura_id"]
            isOneToOne: false
            referencedRelation: "culturas"
            referencedColumns: ["id"]
          },
        ]
      }
      atbs: {
        Row: {
          agente_alvo: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          dose: string | null
          droga: string
          duracao_planejada_dias: number | null
          foco: string | null
          frequencia: string | null
          id: string
          intencao: string | null
          motivo_suspensao: string | null
          paciente_id: string
          updated_at: string
          user_id: string | null
          via: string | null
        }
        Insert: {
          agente_alvo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dose?: string | null
          droga: string
          duracao_planejada_dias?: number | null
          foco?: string | null
          frequencia?: string | null
          id?: string
          intencao?: string | null
          motivo_suspensao?: string | null
          paciente_id: string
          updated_at?: string
          user_id?: string | null
          via?: string | null
        }
        Update: {
          agente_alvo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dose?: string | null
          droga?: string
          duracao_planejada_dias?: number | null
          foco?: string | null
          frequencia?: string | null
          id?: string
          intencao?: string | null
          motivo_suspensao?: string | null
          paciente_id?: string
          updated_at?: string
          user_id?: string | null
          via?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atbs_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atbs_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      culturas: {
        Row: {
          agente: string | null
          coleta_ts: string
          created_at: string
          crescimento: boolean
          id: string
          laudo_ts: string | null
          material: string
          observacoes: string | null
          paciente_id: string
          ufc_por_ml: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agente?: string | null
          coleta_ts: string
          created_at?: string
          crescimento?: boolean
          id?: string
          laudo_ts?: string | null
          material: string
          observacoes?: string | null
          paciente_id: string
          ufc_por_ml?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agente?: string | null
          coleta_ts?: string
          created_at?: string
          crescimento?: boolean
          id?: string
          laudo_ts?: string | null
          material?: string
          observacoes?: string | null
          paciente_id?: string
          ufc_por_ml?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culturas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culturas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      eventos_clinicos: {
        Row: {
          confidence: number | null
          created_at: string
          evolucao_id: string | null
          fonte: string
          id: string
          paciente_id: string
          requires_review: boolean
          source_text: string | null
          tipo: string
          ts: string
          unidade: string | null
          user_id: string | null
          valor_json: Json | null
          valor_num: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          evolucao_id?: string | null
          fonte: string
          id?: string
          paciente_id: string
          requires_review?: boolean
          source_text?: string | null
          tipo: string
          ts: string
          unidade?: string | null
          user_id?: string | null
          valor_json?: Json | null
          valor_num?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          evolucao_id?: string | null
          fonte?: string
          id?: string
          paciente_id?: string
          requires_review?: boolean
          source_text?: string | null
          tipo?: string
          ts?: string
          unidade?: string | null
          user_id?: string | null
          valor_json?: Json | null
          valor_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_clinicos_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "evolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["evolucao_id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      evolucoes: {
        Row: {
          conduta: string[]
          condutas_sistemas: Json
          created_at: string
          data_evolucao: string
          dvas: Json
          hemato: Json
          hemo: Json
          id: string
          impressao: string[]
          infecto: Json
          neuro: Json
          paciente_id: string
          plantao: string
          prescricao: Json | null
          problemas_ativos: Json
          renal: Json
          resp: Json
          riscos: Json
          sedativos: Json
          sofa_snapshot: Json | null
          sofa_total: number | null
          tgi: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conduta?: string[]
          condutas_sistemas?: Json
          created_at?: string
          data_evolucao?: string
          dvas?: Json
          hemato?: Json
          hemo?: Json
          id?: string
          impressao?: string[]
          infecto?: Json
          neuro?: Json
          paciente_id: string
          plantao?: string
          prescricao?: Json | null
          problemas_ativos?: Json
          renal?: Json
          resp?: Json
          riscos?: Json
          sedativos?: Json
          sofa_snapshot?: Json | null
          sofa_total?: number | null
          tgi?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conduta?: string[]
          condutas_sistemas?: Json
          created_at?: string
          data_evolucao?: string
          dvas?: Json
          hemato?: Json
          hemo?: Json
          id?: string
          impressao?: string[]
          infecto?: Json
          neuro?: Json
          paciente_id?: string
          plantao?: string
          prescricao?: Json | null
          problemas_ativos?: Json
          renal?: Json
          resp?: Json
          riscos?: Json
          sedativos?: Json
          sofa_snapshot?: Json | null
          sofa_total?: number | null
          tgi?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolucoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      ingest_audit_log: {
        Row: {
          created_at: string
          error_msg: string | null
          eventos_ids: string[] | null
          fonte: string | null
          id: string
          ok: boolean
          paciente_id: string | null
          payload_raw: Json | null
          response: Json | null
          source_type: string | null
          user_id: string | null
          warnings: string[] | null
        }
        Insert: {
          created_at?: string
          error_msg?: string | null
          eventos_ids?: string[] | null
          fonte?: string | null
          id?: string
          ok: boolean
          paciente_id?: string | null
          payload_raw?: Json | null
          response?: Json | null
          source_type?: string | null
          user_id?: string | null
          warnings?: string[] | null
        }
        Update: {
          created_at?: string
          error_msg?: string | null
          eventos_ids?: string[] | null
          fonte?: string | null
          id?: string
          ok?: boolean
          paciente_id?: string | null
          payload_raw?: Json | null
          response?: Json | null
          source_type?: string | null
          user_id?: string | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_audit_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_audit_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      memorias: {
        Row: {
          conteudo: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          alergias: string | null
          altura: number | null
          created_at: string
          data_adm: string
          dispositivos: Json
          gravidade: string
          hd: string | null
          id: string
          idade: number | null
          imc: number | null
          isolation: string
          leito: string
          nome: string
          out_of_range_count: number
          patient_summary: Json | null
          peso: number | null
          riscos_flags: Json
          severidade_visual: string
          sofa_baseline: number | null
          status_leito: string
          updated_at: string
          user_id: string | null
          uti: string
        }
        Insert: {
          alergias?: string | null
          altura?: number | null
          created_at?: string
          data_adm?: string
          dispositivos?: Json
          gravidade?: string
          hd?: string | null
          id?: string
          idade?: number | null
          imc?: number | null
          isolation?: string
          leito: string
          nome: string
          out_of_range_count?: number
          patient_summary?: Json | null
          peso?: number | null
          riscos_flags?: Json
          severidade_visual?: string
          sofa_baseline?: number | null
          status_leito?: string
          updated_at?: string
          user_id?: string | null
          uti: string
        }
        Update: {
          alergias?: string | null
          altura?: number | null
          created_at?: string
          data_adm?: string
          dispositivos?: Json
          gravidade?: string
          hd?: string | null
          id?: string
          idade?: number | null
          imc?: number | null
          isolation?: string
          leito?: string
          nome?: string
          out_of_range_count?: number
          patient_summary?: Json | null
          peso?: number | null
          riscos_flags?: Json
          severidade_visual?: string
          sofa_baseline?: number | null
          status_leito?: string
          updated_at?: string
          user_id?: string | null
          uti?: string
        }
        Relationships: []
      }
      pendencias: {
        Row: {
          concluida: boolean
          concluida_at: string | null
          created_at: string
          evolucao_id: string | null
          id: string
          paciente_id: string
          prioridade: number
          tarefa: string
          user_id: string | null
        }
        Insert: {
          concluida?: boolean
          concluida_at?: string | null
          created_at?: string
          evolucao_id?: string | null
          id?: string
          paciente_id: string
          prioridade?: number
          tarefa: string
          user_id?: string | null
        }
        Update: {
          concluida?: boolean
          concluida_at?: string | null
          created_at?: string
          evolucao_id?: string | null
          id?: string
          paciente_id?: string
          prioridade?: number
          tarefa?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pendencias_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "evolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendencias_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["evolucao_id"]
          },
          {
            foreignKeyName: "pendencias_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendencias_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      trend_rules: {
        Row: {
          ativo: boolean
          created_at: string
          fonte: string | null
          id: string
          janela_max_horas: number | null
          limiar: number
          mensagem: string
          modo: string
          ordem: number
          rotulo: string
          severidade: string
          tipo_evento: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          fonte?: string | null
          id?: string
          janela_max_horas?: number | null
          limiar: number
          mensagem: string
          modo: string
          ordem?: number
          rotulo: string
          severidade: string
          tipo_evento: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          fonte?: string | null
          id?: string
          janela_max_horas?: number | null
          limiar?: number
          mensagem?: string
          modo?: string
          ordem?: number
          rotulo?: string
          severidade?: string
          tipo_evento?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_alertas_abertos: {
        Row: {
          criticos: number | null
          infos: number | null
          leito: string | null
          nome: string | null
          paciente_id: string | null
          total: number | null
          uti: string | null
          warnings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_log_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      vw_bh_acumulado: {
        Row: {
          bh_24h: number | null
          bh_48h: number | null
          bh_72h: number | null
          eventos_24h: number | null
          paciente_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      vw_dashboard_uti: {
        Row: {
          data_adm: string | null
          delta_sofa_24h: number | null
          dias_internacao: number | null
          dispositivos: Json | null
          dvas: Json | null
          evolucao_id: string | null
          gravidade: string | null
          hd: string | null
          idade: number | null
          isolation: string | null
          leito: string | null
          nome: string | null
          out_of_range_count: number | null
          paciente_id: string | null
          pendencias_abertas: number | null
          peso: number | null
          sedativos: Json | null
          severidade_visual: string | null
          sofa_snapshot: Json | null
          sofa_total: number | null
          status_leito: string | null
          ultima_evolucao: string | null
          user_id: string | null
          uti: string | null
        }
        Relationships: []
      }
      vw_dias_atb_ativo: {
        Row: {
          agente_alvo: string | null
          atb_id: string | null
          data_inicio: string | null
          dias_terapia: number | null
          droga: string | null
          foco: string | null
          frequencia: string | null
          intencao: string | null
          paciente_id: string | null
          stewardship_flag: string | null
          via: string | null
        }
        Insert: {
          agente_alvo?: string | null
          atb_id?: string | null
          data_inicio?: string | null
          dias_terapia?: never
          droga?: string | null
          foco?: string | null
          frequencia?: string | null
          intencao?: string | null
          paciente_id?: string | null
          stewardship_flag?: never
          via?: string | null
        }
        Update: {
          agente_alvo?: string | null
          atb_id?: string | null
          data_inicio?: string | null
          dias_terapia?: never
          droga?: string | null
          foco?: string | null
          frequencia?: string | null
          intencao?: string | null
          paciente_id?: string | null
          stewardship_flag?: never
          via?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atbs_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atbs_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      vw_eventos_pendentes_revisao: {
        Row: {
          confidence: number | null
          created_at: string | null
          evolucao_id: string | null
          fonte: string | null
          id: string | null
          paciente_id: string | null
          requires_review: boolean | null
          source_text: string | null
          tipo: string | null
          ts: string | null
          unidade: string | null
          user_id: string | null
          valor_json: Json | null
          valor_num: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          evolucao_id?: string | null
          fonte?: string | null
          id?: string | null
          paciente_id?: string | null
          requires_review?: boolean | null
          source_text?: string | null
          tipo?: string | null
          ts?: string | null
          unidade?: string | null
          user_id?: string | null
          valor_json?: Json | null
          valor_num?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          evolucao_id?: string | null
          fonte?: string | null
          id?: string | null
          paciente_id?: string | null
          requires_review?: boolean | null
          source_text?: string | null
          tipo?: string | null
          ts?: string | null
          unidade?: string | null
          user_id?: string | null
          valor_json?: Json | null
          valor_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_clinicos_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "evolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_evolucao_id_fkey"
            columns: ["evolucao_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["evolucao_id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      vw_eventos_tendencia: {
        Row: {
          delta: number | null
          gap_horas: number | null
          paciente_id: string | null
          tipo: string | null
          ts: string | null
          unidade: string | null
          valor_anterior: number | null
          valor_num: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
      vw_sofa_trend_72h: {
        Row: {
          paciente_id: string | null
          sofa_total: number | null
          ts: string | null
        }
        Insert: {
          paciente_id?: string | null
          sofa_total?: number | null
          ts?: string | null
        }
        Update: {
          paciente_id?: string | null
          sofa_total?: number | null
          ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_clinicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_uti"
            referencedColumns: ["paciente_id"]
          },
        ]
      }
    }
    Functions: {
      fn_alert_hash: {
        Args: { p_paciente_id: string; p_payload: Json; p_tipo: string }
        Returns: string
      }
      match_memorias: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          conteudo: string
          id: number
          similarity: number
        }[]
      }
      save_ficha: {
        Args: {
          p_evol: Json
          p_evolucao_id: string
          p_pac: Json
          p_paciente_id: string
          p_pendencias?: Json
          p_plantao: string
        }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      gravidade_enum: "estavel" | "moderado" | "grave" | "critico" | "obito"
      status_leito_enum: "ativo" | "alta" | "obito" | "transferencia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gravidade_enum: ["estavel", "moderado", "grave", "critico", "obito"],
      status_leito_enum: ["ativo", "alta", "obito", "transferencia"],
    },
  },
} as const
