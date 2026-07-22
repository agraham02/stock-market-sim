"use client";

import { driver, type Driver } from "driver.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useTourStore } from "@/store/tour-store";

/** Polls for `selector` to appear (e.g. after a client-side route change) and resolves the element.
 * driver.js's own `waitForElement` config also retries internally, but its ad-hoc `.highlight()`
 * path (as opposed to its full `.drive()` step flow) doesn't reliably scroll the target into view
 * before positioning the popover — resolving the element ourselves first lets us scroll it into
 * place synchronously before handing it to driver.js. */
function waitForElement(selector: string, timeoutMs = 6000): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = performance.now();
    function check() {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (performance.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    }
    check();
  });
}

/** Mounted once globally. Drives a single driver.js instance across steps, navigating between
 * pages as needed. */
export function TourRunner() {
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<Driver | null>(null);

  const activeTourId = useTourStore((s) => s.activeTourId);
  const steps = useTourStore((s) => s.steps);
  const stepIndex = useTourStore((s) => s.stepIndex);

  useEffect(() => {
    if (!driverRef.current) {
      driverRef.current = driver({
        animate: true,
        showProgress: true,
        overlayOpacity: 0.65,
        stagePadding: 8,
        stageRadius: 8,
        popoverClass: "sim-tour-popover",
        onCloseClick: () => useTourStore.getState().stop(),
        onDoneClick: () => useTourStore.getState().stop(),
        onNextClick: () => {
          const { stepIndex: i, steps: s, setStepIndex, stop } = useTourStore.getState();
          if (i < s.length - 1) setStepIndex(i + 1);
          else stop();
        },
        onPrevClick: () => {
          const { stepIndex: i, setStepIndex } = useTourStore.getState();
          if (i > 0) setStepIndex(i - 1);
        },
      });
    }

    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  useEffect(() => {
    const driverObj = driverRef.current;
    if (!driverObj) return;

    if (!activeTourId || steps.length === 0) {
      driverObj.destroy();
      return;
    }

    const step = steps[stepIndex];
    if (step.path && step.path !== pathname) {
      router.push(step.path);
      return; // effect re-fires once `pathname` updates
    }

    let cancelled = false;
    waitForElement(step.target).then((el) => {
      if (cancelled || !el) return;
      el.scrollIntoView({ block: "center", behavior: "auto" });
      // Next.js resets scroll to top after a route change, racing with the scroll above — wait
      // for that to settle, then re-assert our scroll, before letting driver.js measure position.
      // Applied whenever the step declares a path, since we can't cheaply tell whether this
      // specific effect run followed a real navigation or just a re-highlight of the same step.
      const settleMs = step.path ? 120 : 0;
      setTimeout(() => {
        if (cancelled) return;
        el.scrollIntoView({ block: "center", behavior: "auto" });
        driverObj.highlight({
          element: el,
          popover: {
            title: step.title,
            description: step.description,
            side: step.side,
            showButtons: [
              ...(stepIndex > 0 ? (["previous"] as const) : []),
              ...(stepIndex < steps.length - 1 ? (["next"] as const) : []),
              "close",
            ],
            progressText: `Step ${stepIndex + 1} of ${steps.length}`,
            doneBtnText: "Done",
          },
        });
      }, settleMs);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTourId, steps, stepIndex, pathname, router]);

  return null;
}
