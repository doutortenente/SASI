import { create } from "zustand";
type Split = "single" | "split";
type WarRoomState = { modo: Split; painelDireito: "scores" | "doses" | "protocolos" | null;
  setModo: (m: Split) => void; setPainel: (p: WarRoomState["painelDireito"]) => void };
export const useWarRoomStore = create<WarRoomState>((set) => ({
  modo: "single", painelDireito: null, setModo: (modo) => set({ modo }), setPainel: (painelDireito) => set({ painelDireito }),
}));
