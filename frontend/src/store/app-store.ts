import { create } from "zustand";

interface AppState {
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  chatPanelOpen: boolean;
  setChatPanelOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeSymbol: "SPY",
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol.toUpperCase() }),
  chatPanelOpen: false,
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
}));
