import { create } from "zustand";
type BedState = { leitoSelecionado: string | null; selecionar: (id: string | null) => void };
export const useBedStore = create<BedState>((set) => ({ leitoSelecionado: null, selecionar: (id) => set({ leitoSelecionado: id }) }));
