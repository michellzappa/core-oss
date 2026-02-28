"use client";

import React from "react";
import { FileDown } from "lucide-react";

interface PdfExportButtonProps {
  offerData?: {
    offer?: { id?: string };
    services?: unknown[];
  };
  shortId?: string;
}

/**
 * Simple PDF export using browser's native print-to-PDF functionality.
 * This avoids all the complexity of @react-pdf/renderer and crypto polyfills.
 * Users can save as PDF from the print dialog.
 */
export function PdfExportButton({ offerData, shortId }: PdfExportButtonProps) {
  const handlePrint = () => {
    if (typeof window === 'undefined') {
      return;
    }

    // Trigger browser's print dialog
    // Users can select "Save as PDF" as the destination
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-md flex items-center"
      aria-label="Print or Save as PDF"
    >
      <FileDown size={18} className="mr-2" />
      Print / Save as PDF
    </button>
  );
}
