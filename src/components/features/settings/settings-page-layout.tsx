import { ReactNode } from "react";
import Link from "next/link";
import SettingsNav from "./settings-nav";
import { SETTINGS_GROUPS } from "./settings.config";

export interface SettingsPageLayoutProps {
  group: string;
  current: string;
  title: string;
  children: ReactNode;
}

export default function SettingsPageLayout({
  group,
  current,
  title,
  children,
}: SettingsPageLayoutProps) {
  const activeGroup = SETTINGS_GROUPS.find((g) => g.slug === group);

  return (
    <div className="space-y-4">
      <SettingsNav currentGroup={group} />
      {activeGroup && activeGroup.items.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {activeGroup.items.map((item) => (
            <Link
              key={item.slug}
              href={`/dashboard/settings/${item.slug}`}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                current === item.slug
                  ? "bg-[var(--accent)] text-[var(--foreground)] font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
      <div className="flex flex-col">
        <h1 className="page-title">{title}</h1>
      </div>
      {children}
    </div>
  );
}
