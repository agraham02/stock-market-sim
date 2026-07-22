import { create } from "zustand";

import type { TourStep } from "@/lib/tours/types";

interface TourState {
  activeTourId: string | null;
  steps: TourStep[];
  stepIndex: number;
  start: (tourId: string, steps: TourStep[]) => void;
  stop: () => void;
  setStepIndex: (index: number) => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTourId: null,
  steps: [],
  stepIndex: 0,
  start: (tourId, steps) => set({ activeTourId: tourId, steps, stepIndex: 0 }),
  stop: () => set({ activeTourId: null, steps: [], stepIndex: 0 }),
  setStepIndex: (index) => set({ stepIndex: index }),
}));
