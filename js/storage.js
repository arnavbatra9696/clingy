/**
 * Saves and loads Clingy's timer snapshot in the browser.
 * Other files should not call localStorage themselves.
 */

const KEY = "clingy-m1";

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
