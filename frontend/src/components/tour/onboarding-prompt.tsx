"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { ONBOARDING_TOUR_STEPS } from "@/lib/tours/onboarding-tour";
import { useTourStore } from "@/store/tour-store";

const PROMPTED_KEY = "onboarding-tour-prompted";

/** Mounted once globally. Offers the onboarding tour once, on first visit, via a dismissible toast. */
export function OnboardingPrompt() {
  useEffect(() => {
    let prompted = false;
    try {
      prompted = window.localStorage.getItem(PROMPTED_KEY) === "true";
    } catch {
      // localStorage unavailable — skip the prompt rather than nagging every load
      return;
    }
    if (prompted) return;

    toast("New here?", {
      description: "Take a 2-minute tour of the Dashboard, Symbol view, Positions, Journal, and Learn Hub.",
      duration: 15000,
      action: {
        label: "Take the tour",
        onClick: () => useTourStore.getState().start("onboarding", ONBOARDING_TOUR_STEPS),
      },
    });

    try {
      window.localStorage.setItem(PROMPTED_KEY, "true");
    } catch {
      // ignore — worst case the toast reappears next load
    }
  }, []);

  return null;
}
