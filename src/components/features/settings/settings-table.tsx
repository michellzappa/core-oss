import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: "left" | "right";
}

interface SettingsTableProps<T> {
  columns: Column<T>[];
  items: T[];
  emptyLabel: string;
}

export default function SettingsTable<T>({
  columns,
  items,
  emptyLabel,
}: SettingsTableProps<T>) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-card minimal-shadow minimal-border rounded-md p-6 text-center">
        <p className="text-[var(--gray-600)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 minimal-shadow minimal-border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
          {items.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
