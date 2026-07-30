'use client';
import { useEffect, useState } from "react";
import { subscribeTable } from "@/lib/supabase/realtime";
// Recarrega os leitos quando pacientes/pendencias mudam (tempo real). Implementar o fetch no service de beds.
export function useRealtimeBeds(reload: () => void) {
  const [conectado, setConectado] = useState(false);
  useEffect(() => { const off = subscribeTable("pacientes", reload); setConectado(true); return () => { off(); setConectado(false); }; }, [reload]);
  return { conectado };
}
