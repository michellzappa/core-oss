import Link from "next/link";
import { SETTINGS_GROUPS } from "./settings.config";

export default function SettingsNav({
  currentGroup,
}: {
  currentGroup?: string;
}) {
  // Find which group the current page belongs to
  const activeGroupSlug =
    currentGroup ||
    SETTINGS_GROUPS.find((g) =>
      g.items.some((i) => i.slug === currentGroup)
    )?.slug;

  return (
    <nav className="w-full">
      <ul className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {SETTINGS_GROUPS.map((group) => {
          const isActive = activeGroupSlug === group.slug;
          return (
            <li key={group.slug}>
              <Link
                href={`/dashboard/settings/${group.firstItemSlug}`}
                className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ${
                  isActive
                    ? "bg-white dark:bg-neutral-900 text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {group.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
