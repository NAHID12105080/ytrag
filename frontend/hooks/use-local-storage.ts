"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(key: string, callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === key) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/** Hydration-safe localStorage-backed state (falls back to `defaultValue` on the server). */
export function useLocalStorage(key: string, defaultValue: string) {
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key) ?? defaultValue,
    [key, defaultValue],
  );
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    getSnapshot,
    getServerSnapshot,
  );

  const setValue = useCallback(
    (next: string) => {
      window.localStorage.setItem(key, next);
      // storage events don't fire in the tab that wrote the value — dispatch
      // one manually so this tab's subscribers pick up the change too.
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: next }));
    },
    [key],
  );

  return [value, setValue] as const;
}
