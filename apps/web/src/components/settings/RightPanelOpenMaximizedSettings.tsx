import {
  DEFAULT_OPEN_MAXIMIZED,
  OPEN_MAXIMIZED_SURFACES,
  useOpenMaximizedSurfaces,
} from "../../rightPanelOpenMaximized";
import { Switch } from "../ui/switch";
import { SettingResetButton, SettingsRow, SettingsSection } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";

export function RightPanelOpenMaximizedSection() {
  const [surfaces, setSurfaces] = useOpenMaximizedSurfaces();
  const isDefault =
    surfaces.length === DEFAULT_OPEN_MAXIMIZED.length &&
    DEFAULT_OPEN_MAXIMIZED.every((id) => surfaces.includes(id));

  return (
    <SettingsSection
      id={searchableSetting("right-panel-open-maximized").id}
      title="Open maximized"
      headerAction={
        isDefault ? null : (
          <SettingResetButton
            label="open maximized surfaces"
            onClick={() => setSurfaces(DEFAULT_OPEN_MAXIMIZED)}
          />
        )
      }
    >
      {OPEN_MAXIMIZED_SURFACES.map((surface) => (
        <SettingsRow
          key={surface.id}
          title={surface.label}
          devicePreference
          control={
            <Switch
              checked={surfaces.includes(surface.id)}
              onCheckedChange={(checked) =>
                setSurfaces((current) =>
                  checked
                    ? [...current.filter((id) => id !== surface.id), surface.id]
                    : current.filter((id) => id !== surface.id),
                )
              }
              aria-label={`Open ${surface.label} maximized`}
            />
          }
        />
      ))}
    </SettingsSection>
  );
}
