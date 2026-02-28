import { ReactNode } from "react";

interface SettingsListShellProps {
  title: string;
  addLabel: string;
  onAddClick?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
}

export default function SettingsListShell({
  title,
  addLabel,
  onAddClick,
  headerRight,
  children,
}: SettingsListShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {headerRight}
          {onAddClick ? (
            <button
              onClick={onAddClick}
              className="minimal-button px-3 py-1.5 text-sm flex items-center gap-1"
            >
              {addLabel}
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
