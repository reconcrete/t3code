import { LayersIcon, Settings2Icon } from "lucide-react";

import type { SidebarView } from "../../sidebarViews";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "../ui/menu";
import { SidebarHeaderIconButton } from "./SidebarThreadHeader";

const ALL_THREADS_VALUE = "__all__";

export function SidebarViewPicker(props: {
  readonly views: ReadonlyArray<SidebarView>;
  readonly activeView: SidebarView | null;
  readonly onSelect: (viewId: string | null) => void;
  readonly onEditViews: () => void;
}) {
  const { views, activeView, onSelect, onEditViews } = props;
  return (
    <Menu>
      <MenuTrigger
        render={
          <SidebarHeaderIconButton
            label={activeView ? `View: ${activeView.name || "Untitled view"}` : "Views"}
          />
        }
      >
        <LayersIcon />
      </MenuTrigger>
      <MenuPopup align="start" className="min-w-48">
        <MenuRadioGroup
          value={activeView?.id ?? ALL_THREADS_VALUE}
          onValueChange={(value) =>
            onSelect(value === ALL_THREADS_VALUE ? null : (value as string))
          }
        >
          <MenuRadioItem value={ALL_THREADS_VALUE} closeOnClick>
            All threads
          </MenuRadioItem>
          {views.map((view) => (
            <MenuRadioItem key={view.id} value={view.id} closeOnClick>
              <span className="min-w-0 truncate">{view.name || "Untitled view"}</span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuItem onClick={onEditViews}>
          <Settings2Icon />
          Edit views…
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
