import * as Schema from "effect/Schema";

import {
  readLocalStorageValue,
  useLocalStorage,
  writeLocalStorageValue,
} from "./hooks/useLocalStorage";
import type { RightPanelKind } from "./rightPanelStore";

/** A surface as the "Open a surface" menu names it; Files also covers single file tabs. */
export const OPEN_MAXIMIZED_SURFACES = [
  { id: "preview", label: "Browser" },
  { id: "terminal", label: "Terminal" },
  { id: "files", label: "Files" },
  { id: "diff", label: "Diff" },
  { id: "pull-request", label: "Pull request" },
  { id: "pull-requests", label: "Linked pull requests" },
  { id: "device", label: "Device" },
  { id: "side-chat", label: "Side chat" },
] as const satisfies ReadonlyArray<{ id: RightPanelKind; label: string }>;

export type OpenMaximizedSurfaceId = (typeof OPEN_MAXIMIZED_SURFACES)[number]["id"];

const OPEN_MAXIMIZED_KEY = "t3code:right-panel:open-maximized";
const OpenMaximizedSchema = Schema.Array(Schema.String);
export const DEFAULT_OPEN_MAXIMIZED: ReadonlyArray<string> = ["diff", "pull-request"];

export function useOpenMaximizedSurfaces() {
  return useLocalStorage(OPEN_MAXIMIZED_KEY, DEFAULT_OPEN_MAXIMIZED, OpenMaximizedSchema);
}

export function setOpenMaximizedSurfaces(surfaceIds: ReadonlyArray<string>): void {
  writeLocalStorageValue(
    OPEN_MAXIMIZED_KEY,
    surfaceIds,
    DEFAULT_OPEN_MAXIMIZED,
    OpenMaximizedSchema,
  );
}

export function surfaceOpensMaximized(kind: RightPanelKind): boolean {
  const surfaceId = kind === "file" ? "files" : kind;
  return readLocalStorageValue(
    OPEN_MAXIMIZED_KEY,
    DEFAULT_OPEN_MAXIMIZED,
    OpenMaximizedSchema,
  ).includes(surfaceId);
}
