"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface OfferHistoryPoint {
  monthKey: string;
  label: string;
  totalAmount: number;
  acceptedAmount: number;
  expiredAmount?: number;
}

interface OfferHistoryBarChartProps {
  data: OfferHistoryPoint[];
  currencyCode?: string;
}

const WINDOW_SIZE = 12;

function getRangeLabel(windowIndex: number): string {
  if (windowIndex === 0) return "latest 12 months";
  if (windowIndex === 1) return "12–24 months ago";
  if (windowIndex === 2) return "24–36 months ago";
  return "last 12 months";
}

export function OfferHistoryBarChart({
  data,
  currencyCode = "EUR",
}: OfferHistoryBarChartProps) {
  const hasAnyValue = data.some(
    (d) =>
      d.totalAmount > 0 ||
      d.acceptedAmount > 0 ||
      (d.expiredAmount ?? 0) > 0,
  );

  const [windowIndex, setWindowIndex] = useState(0); // 0 = latest

  const { windowPoints, maxValue, maxWindowIndex, rangeLabel } = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    if (!safeData.length || !hasAnyValue) {
      return {
        windowPoints: [] as OfferHistoryPoint[],
        maxValue: 0,
        maxWindowIndex: 0,
        rangeLabel: "last 12 months",
      };
    }

    const totalMonths = safeData.length;
    const rawMaxWindowIndex = Math.floor((totalMonths - 1) / WINDOW_SIZE);
    const clampedMaxWindowIndex = Math.min(rawMaxWindowIndex, 2);
    const clampedWindowIndex = Math.min(windowIndex, clampedMaxWindowIndex);

    const end = totalMonths - WINDOW_SIZE * clampedWindowIndex;
    const start = Math.max(end - WINDOW_SIZE, 0);
    const slice = safeData.slice(start, end);

    const max = Math.max(...slice.map((point) => point.totalAmount));

    return {
      windowPoints: slice,
      maxValue: max,
      maxWindowIndex: clampedMaxWindowIndex,
      rangeLabel: getRangeLabel(clampedWindowIndex),
    };
  }, [data, hasAnyValue, windowIndex]);

  if (!windowPoints.length || !hasAnyValue) {
    return (
      <section className="bg-[var(--card)] minimal-shadow minimal-border rounded-lg p-4 sm:p-5">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Offer history
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Last 12 months
          </p>
        </header>
        <p className="text-xs text-[var(--text-secondary)]">
          No offer value data available yet.
        </p>
      </section>
    );
  }

  const getHeightPct = (value: number): number => {
    if (maxValue <= 0) return 0;
    const pct = (value / maxValue) * 100;
    return value > 0 && pct < 6 ? 6 : pct;
  };

  const canGoOlder = windowIndex < maxWindowIndex;
  const canGoNewer = windowIndex > 0;

  return (
    <section className="bg-[var(--card)] minimal-shadow minimal-border rounded-lg p-4 sm:p-5">
      <header className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-[10px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
            SALES
          </h2>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {rangeLabel}
          </p>
        </div>
        {maxWindowIndex > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-[var(--muted)] bg-[var(--background)] px-1 py-0.5">
            <button
              type="button"
              onClick={() =>
                setWindowIndex((current) =>
                  current < maxWindowIndex ? current + 1 : current,
                )
              }
              disabled={!canGoOlder}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors ${
                canGoOlder
                  ? "hover:bg-[var(--muted)] hover:text-[var(--text-primary)]"
                  : "opacity-40 cursor-default"
              }`}
              aria-label="Show 12 months older"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <div className="px-1 text-[10px] font-medium text-[var(--text-secondary)]">
              {windowIndex + 1}/{maxWindowIndex + 1}
            </div>
            <button
              type="button"
              onClick={() =>
                setWindowIndex((current) => (current > 0 ? current - 1 : 0))
              }
              disabled={!canGoNewer}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors ${
                canGoNewer
                  ? "hover:bg-[var(--muted)] hover:text-[var(--text-primary)]"
                  : "opacity-40 cursor-default"
              }`}
              aria-label="Show newer 12 months"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </header>

      <div className="mt-3 sm:mt-4">
        <div className="flex items-center justify-end gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300">
            <span className="inline-block h-2 w-3 bg-neutral-300 dark:bg-neutral-600" />
            <span>Expired</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: "var(--accent-color)" }} />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300">
            <span className="inline-block h-2 w-3 bg-neutral-900 dark:bg-white" />
            <span>Accepted</span>
          </div>
        </div>

        {/* Fixed-height chart area */}
        <div className="h-40 sm:h-48 flex items-end gap-2 sm:gap-3">
          {windowPoints.map((point) => {
            const expiredAmount = point.expiredAmount ?? 0;
            const acceptedAmount = point.acceptedAmount ?? 0;
            const activeAmount = Math.max(
              point.totalAmount - expiredAmount - acceptedAmount,
              0,
            );

            const expiredHeight = getHeightPct(expiredAmount);
            const activeHeight = getHeightPct(activeAmount);
            const acceptedHeight = getHeightPct(acceptedAmount);

            const expiredBottom = activeHeight + acceptedHeight;
            const activeBottom = acceptedHeight;

            const displayExpired = formatCurrency(expiredAmount, currencyCode);
            const displayActive = formatCurrency(activeAmount, currencyCode);
            const displayAccepted = formatCurrency(acceptedAmount, currencyCode);

            return (
              <div
                key={point.monthKey}
                className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full"
              >
                {/* Column bar: funnel from expired (top) to active (middle) to accepted (bottom) */}
                <div className="relative w-full h-full flex items-end justify-center">
                  <div className="relative w-3 sm:w-4 h-full">
                    {expiredAmount > 0 && (
                      <div
                        className="absolute left-0 right-0 bg-neutral-300 dark:bg-neutral-600"
                        style={{
                          height: `${expiredHeight}%`,
                          bottom: `${expiredBottom}%`,
                        }}
                      />
                    )}
                    {activeAmount > 0 && (
                      <div
                        className="absolute left-0 right-0 bg-[var(--accent-color)]"
                        style={{
                          height: `${activeHeight}%`,
                          bottom: `${activeBottom}%`,
                        }}
                      />
                    )}
                    {acceptedAmount > 0 && (
                      <div
                        className="absolute left-0 right-0 bg-neutral-900 dark:bg-white"
                        style={{ height: `${acceptedHeight}%`, bottom: 0 }}
                      />
                    )}
                  </div>
                </div>

                {/* X-axis label + numeric summary (expired, active, accepted) */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] sm:text-xs font-medium text-neutral-900 dark:text-white truncate max-w-[3rem] sm:max-w-[4rem]">
                    {point.label}
                  </span>
                  {/* Expired */}
                  <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight truncate max-w-[4.5rem] sm:max-w-[5.5rem]">
                    {expiredAmount > 0 ? displayExpired : "0"}
                  </span>
                  {/* Active */}
                  <span className="text-[9px] sm:text-[10px] leading-tight truncate max-w-[4.5rem] sm:max-w-[5.5rem]" style={{ color: "var(--accent-color)" }}>
                    {activeAmount > 0 ? displayActive : "0"}
                  </span>
                  {/* Accepted */}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-900 dark:text-white leading-tight truncate max-w-[4.5rem] sm:max-w-[5.5rem]">
                    {acceptedAmount > 0 ? displayAccepted : "0"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
