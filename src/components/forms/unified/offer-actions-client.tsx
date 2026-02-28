"use client";

import React from "react";
import { Button } from "@/components/ui/primitives/button";
import { ExternalLink } from "lucide-react";

interface OfferActionsClientProps {
  id: string;
}

export default function OfferActionsClient({ id }: OfferActionsClientProps) {
  function handleOpenPublicPage() {
    const idUrl = `${window.location.origin}/offers/view/${id}`;
    window.open(idUrl, "_blank");
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleOpenPublicPage}>
        <ExternalLink className="h-4 w-4 mr-2" /> Open Public Page
      </Button>
    </div>
  );
}
