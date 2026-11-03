import { PlusIcon, Trash2Icon } from "lucide-react";

import { useEnvironmentIdentities } from "../../state/environments";
import { useProjects } from "../../state/entities";
import { type SidebarView, sidebarViewProjectKey, useSidebarViews } from "../../sidebarViews";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { SettingsPageContainer, SettingsSection } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";

function newViewId(): string {
  // crypto.randomUUID needs a secure context, which plain-http LAN clients lack.
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SidebarViewsSettingsPanel() {
  return (
    <SettingsPageContainer>
      <SidebarViewsSettingsSection />
    </SettingsPageContainer>
  );
}

function SidebarViewsSettingsSection() {
  const [views, setViews] = useSidebarViews();
  const projects = useProjects();
  const environments = useEnvironmentIdentities();
  const environmentGroups = environments
    .map((environment) => ({
      ...environment,
      projects: projects
        .filter((project) => project.environmentId === environment.environmentId)
        .filter((project) => !project.archivedAt)
        .toSorted((a, b) => a.title.localeCompare(b.title)),
    }))
    .filter((group) => group.projects.length > 0);

  const updateView = (viewId: string, update: (view: SidebarView) => SidebarView) =>
    setViews((current) => current.map((view) => (view.id === viewId ? update(view) : view)));
  const addView = () =>
    setViews((current) => [
      ...current,
      { id: newViewId(), name: `View ${current.length + 1}`, projectKeys: [] },
    ]);
  const removeView = (viewId: string) =>
    setViews((current) => current.filter((view) => view.id !== viewId));
  const toggleProject = (viewId: string, projectKey: string, checked: boolean) =>
    updateView(viewId, (view) => ({
      ...view,
      projectKeys: checked
        ? [...view.projectKeys.filter((key) => key !== projectKey), projectKey]
        : view.projectKeys.filter((key) => key !== projectKey),
    }));

  return (
    <SettingsSection
      id={searchableSetting("sidebar-views").id}
      title="Views"
      headerAction={
        <Button size="xs" variant="outline" onClick={addView}>
          <PlusIcon />
          New view
        </Button>
      }
    >
      {views.length === 0 ? (
        <p className="px-3 py-3 text-sm text-muted-foreground sm:px-4">
          A view is a set of projects from any environment. Create one, then pick it from the views
          button in the sidebar.
        </p>
      ) : (
        views.map((view) => (
          <div key={view.id} className="flex flex-col gap-3 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <Input
                size="compact"
                aria-label="View name"
                value={view.name}
                onChange={(event) => {
                  const name = event.currentTarget.value;
                  updateView(view.id, (current) => ({ ...current, name }));
                }}
              />
              <Button
                size="icon-sm"
                variant="ghost-destructive"
                aria-label={`Delete ${view.name || "view"}`}
                onClick={() => removeView(view.id)}
              >
                <Trash2Icon />
              </Button>
            </div>
            {environmentGroups.map((environment) => (
              <fieldset key={environment.environmentId} className="flex flex-col gap-1.5">
                <legend className="mb-1 text-xs font-medium text-muted-foreground">
                  {environment.label}
                </legend>
                {environment.projects.map((project) => {
                  const projectKey = sidebarViewProjectKey(project.environmentId, project.id);
                  return (
                    <label key={projectKey} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={view.projectKeys.includes(projectKey)}
                        onCheckedChange={(checked) =>
                          toggleProject(view.id, projectKey, checked === true)
                        }
                      />
                      <span className="min-w-0 truncate">{project.title}</span>
                    </label>
                  );
                })}
              </fieldset>
            ))}
          </div>
        ))
      )}
    </SettingsSection>
  );
}
