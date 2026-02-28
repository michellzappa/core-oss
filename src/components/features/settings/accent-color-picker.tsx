"use client";

import { useState, useEffect, useCallback } from "react";

// 8 colors from oklch.fyi consistent-brightness palette
// L=0.8, C=0.193, hues evenly spaced at 45° intervals
const ACCENT_PRESETS = [
  { label: "Red",         value: "oklch(0.8 0.193 20)" },
  { label: "Orange",      value: "oklch(0.8 0.193 60)" },
  { label: "Lime",        value: "oklch(0.8 0.193 100)" },
  { label: "Green",       value: "oklch(0.8 0.193 140)" },
  { label: "Cyan",        value: "oklch(0.8 0.193 180)" },
  { label: "Blue",        value: "oklch(0.8 0.193 220)" },
  { label: "Violet",      value: "oklch(0.8 0.193 260)" },
  { label: "Purple",      value: "oklch(0.8 0.193 300)" },
];

const DEFAULT_COLOR = ACCENT_PRESETS[2].value; // Lime

export default function AccentColorPicker() {
  const [accentColor, setAccentColor] = useState(DEFAULT_COLOR);
  const [customHex, setCustomHex] = useState("#d6f249");

  useEffect(() => {
    const saved = localStorage.getItem("accent-color");
    if (saved) {
      setAccentColor(saved);
      if (saved.startsWith("#")) setCustomHex(saved);
    }
  }, []);

  const apply = useCallback((color: string) => {
    setAccentColor(color);
    localStorage.setItem("accent-color", color);
    document.documentElement.style.setProperty("--accent-color", color);
  }, []);

  const isPreset = ACCENT_PRESETS.some((p) => p.value === accentColor);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-[var(--foreground)]">
        Accent Color
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Used for focus rings, buttons, and highlights.
      </p>
      <div className="flex items-center gap-3">
        {ACCENT_PRESETS.map((color) => (
          <button
            key={color.value}
            onClick={() => apply(color.value)}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: color.value,
              borderColor:
                accentColor === color.value
                  ? "var(--foreground)"
                  : "transparent",
            }}
            title={color.label}
          />
        ))}
        <span className="text-[var(--text-muted)] text-sm mx-1">|</span>
        <label
          className={`relative w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 overflow-hidden ${
            !isPreset ? "border-[var(--foreground)]" : "border-transparent"
          }`}
          title="Custom color"
        >
          <input
            type="color"
            value={customHex}
            onChange={(e) => {
              setCustomHex(e.target.value);
              apply(e.target.value);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <span
            className="block w-full h-full rounded-full"
            style={{
              backgroundColor: !isPreset ? accentColor : customHex,
              backgroundImage:
                "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
          />
        </label>
      </div>
    </div>
  );
}
