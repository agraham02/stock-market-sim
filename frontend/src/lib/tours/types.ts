export interface TourStep {
  id: string;
  /** Route to navigate to before highlighting this step's target. Omit to stay on the current page. */
  path?: string;
  /** CSS selector for the element to highlight. Convention: `[data-tour="<id>"]`. */
  target: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}
