import React from "react";

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {children}
    </div>
  );
}
