import { createFileRoute } from "@tanstack/react-router";
import { SidebarViewsSettingsPanel } from "../components/settings/SidebarViewsSettings";

export const Route = createFileRoute("/_chat/settings/views")({
  component: SidebarViewsSettingsPanel,
});
