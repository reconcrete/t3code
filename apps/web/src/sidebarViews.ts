import * as Schema from "effect/Schema";

import { useLocalStorage, writeLocalStorageValue } from "./hooks/useLocalStorage";

const SidebarViewSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  /** `${environmentId}:${projectId}`, so one view can hold projects from several environments. */
  projectKeys: Schema.Array(Schema.String),
});
export type SidebarView = typeof SidebarViewSchema.Type;

const SidebarViewsSchema = Schema.Array(SidebarViewSchema);
const ActiveSidebarViewSchema = Schema.NullOr(Schema.String);

const SIDEBAR_VIEWS_KEY = "t3code:sidebar:views";
const ACTIVE_SIDEBAR_VIEW_KEY = "t3code:sidebar:active-view";
const NO_VIEWS: ReadonlyArray<SidebarView> = [];

export function useSidebarViews() {
  return useLocalStorage(SIDEBAR_VIEWS_KEY, NO_VIEWS, SidebarViewsSchema);
}

export function useActiveSidebarViewId(): string | null {
  return useLocalStorage(ACTIVE_SIDEBAR_VIEW_KEY, null, ActiveSidebarViewSchema)[0];
}

export function setActiveSidebarViewId(viewId: string | null): void {
  writeLocalStorageValue(ACTIVE_SIDEBAR_VIEW_KEY, viewId, null, ActiveSidebarViewSchema);
}

export function sidebarViewProjectKey(environmentId: string, projectId: string): string {
  return `${environmentId}:${projectId}`;
}
