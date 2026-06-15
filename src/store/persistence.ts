const STORAGE_KEY = 'musictheorytool_state';

export function loadState(): Record<string, unknown> | undefined {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    return JSON.parse(serialized);
  } catch {
    return undefined;
  }
}

export function saveState(state: Record<string, unknown>): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // localStorage full or unavailable — silently skip
  }
}
