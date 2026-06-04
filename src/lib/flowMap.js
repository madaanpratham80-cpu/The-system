/**
 * THE SYSTEM — branching onboarding flow.
 * After Path Selection, the chosen path determines the ordered list of
 * calibration screens the user walks through before reaching the Dashboard.
 *
 * Universal screens (not in this map): "/" (Boot) -> "/identify" -> "/path-selection".
 */

export const flowMap = {
  academics: [
    "/screen-04a",
    "/screen-05a",
    "/screen-06a",
    "/screen-07a",
    "/screen-08a",
    "/dashboard",
  ],
  fitness: [
    "/screen-04b",
    "/screen-05b",
    "/screen-06b",
    "/screen-07b",
    "/screen-08b",
    "/dashboard",
  ],
  both: [
    "/screen-04b",
    "/screen-05b",
    "/screen-06b",
    "/screen-07b",
    "/screen-05a",
    "/screen-06a",
    "/screen-07a",
    "/screen-08a",
    "/dashboard",
  ],
  "side-quest": ["/screen-04d", "/screen-05d", "/screen-06d", "/dashboard"],
};

/** First calibration screen for a given path. */
export function firstScreen(path) {
  return flowMap[path]?.[0] ?? "/dashboard";
}

/** Route that follows `current` within a path's sequence. */
export function nextScreen(path, current) {
  const seq = flowMap[path];
  if (!seq) return "/dashboard";
  const i = seq.indexOf(current);
  if (i === -1 || i + 1 >= seq.length) return seq[seq.length - 1];
  return seq[i + 1];
}
