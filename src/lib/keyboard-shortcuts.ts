export interface KeyboardShortcut {
  id: string;
  keys: string[];
  combos: string[];
  eventName: string;
  description: string;
  category: string;
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  {
    id: "command_palette",
    keys: ["meta+k", "ctrl+k"],
    combos: ["cmd+k", "ctrl+k"],
    eventName: "global-open-command-palette",
    description: "Open command palette",
    category: "Navigation",
  },
  {
    id: "save_changes",
    keys: ["meta+enter", "ctrl+enter"],
    combos: ["cmd+enter", "ctrl+enter"],
    eventName: "global-save-changes",
    description: "Save changes",
    category: "Forms",
  },
];
