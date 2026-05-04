"use client";

import { mockPersonas, mockScenarios } from "@/lib/mock/data";
import type { Persona, Scenario } from "@/lib/types/domain";

export const ADMIN_DATA_STORAGE_KEY = "ai-role-player:admin-data";
const DATA_KEY = ADMIN_DATA_STORAGE_KEY;
export const ADMIN_DATA_CHANGED_EVENT = "ai-role-player:admin-data-changed";

export interface AdminRuntimeData {
  scenarios: Scenario[];
  personas: Persona[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Stable default snapshot: same reference for SSR, hydration, and empty localStorage. */
export const DEFAULT_ADMIN_RUNTIME: AdminRuntimeData = {
  scenarios: mockScenarios,
  personas: mockPersonas,
};

let adminSnapshotCache: AdminRuntimeData = DEFAULT_ADMIN_RUNTIME;
let adminSnapshotRawKey: string | null = null;

/** Snapshot used for SSR / hydration; must match first client getSnapshot when localStorage is empty. */
export function getServerAdminRuntimeSnapshot(): AdminRuntimeData {
  return DEFAULT_ADMIN_RUNTIME;
}

export function subscribeAdminRuntimeData(onStoreChange: () => void): () => void {
  if (!isBrowser()) {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === DATA_KEY || event.key === null) {
      onStoreChange();
    }
  };
  const onLocal = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(ADMIN_DATA_CHANGED_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, onLocal);
  };
}

export function initializeAdminRuntimeData(): AdminRuntimeData {
  if (!isBrowser()) {
    return DEFAULT_ADMIN_RUNTIME;
  }

  const raw = window.localStorage.getItem(DATA_KEY);
  if (!raw) {
    const serializedDefault = JSON.stringify(DEFAULT_ADMIN_RUNTIME);
    window.localStorage.setItem(DATA_KEY, serializedDefault);
    adminSnapshotRawKey = serializedDefault;
    adminSnapshotCache = DEFAULT_ADMIN_RUNTIME;
    return adminSnapshotCache;
  }

  adminSnapshotRawKey = raw;
  try {
    adminSnapshotCache = JSON.parse(raw) as AdminRuntimeData;
    return adminSnapshotCache;
  } catch {
    const serializedDefault = JSON.stringify(DEFAULT_ADMIN_RUNTIME);
    window.localStorage.setItem(DATA_KEY, serializedDefault);
    adminSnapshotRawKey = serializedDefault;
    adminSnapshotCache = DEFAULT_ADMIN_RUNTIME;
    return adminSnapshotCache;
  }
}

export function getAdminRuntimeData(): AdminRuntimeData {
  if (!isBrowser()) {
    return DEFAULT_ADMIN_RUNTIME;
  }

  const raw = window.localStorage.getItem(DATA_KEY);
  const key = raw === null ? "" : raw;

  if (key === adminSnapshotRawKey) {
    return adminSnapshotCache;
  }

  adminSnapshotRawKey = key;

  if (!raw) {
    adminSnapshotCache = DEFAULT_ADMIN_RUNTIME;
    return adminSnapshotCache;
  }

  try {
    adminSnapshotCache = JSON.parse(raw) as AdminRuntimeData;
    return adminSnapshotCache;
  } catch {
    adminSnapshotCache = DEFAULT_ADMIN_RUNTIME;
    return adminSnapshotCache;
  }
}

export function setAdminRuntimeData(data: AdminRuntimeData): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  adminSnapshotRawKey = null;
  window.dispatchEvent(new Event(ADMIN_DATA_CHANGED_EVENT));
}

export function clearSessionEntryGate(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem("ai-role-player:session-setup");
  window.sessionStorage.removeItem("ai-role-player:session-entry-gate");
}
