/**
 * Lightweight onboarding state shared across routed screens.
 * Persisted in sessionStorage so it survives client-side navigation but
 * resets when the tab closes. Replace/extend with Supabase once auth is wired.
 *
 * Shape: { name, authMethod: 'name' | 'google', userId, path, ... }
 */

const KEY = "the-system:onboarding";

export function getSystemState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function setSystemState(patch) {
  if (typeof window === "undefined") return {};
  const next = { ...getSystemState(), ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSystemState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
