"use client";

import { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Alert, AlertDescription } from "@/components/ui/primitives/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/navigation/dialog";

interface ShareOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  onGenerateLink: (
    offerId: string,
    expiresInDays: number
  ) => Promise<{ shareUrl: string; expiresInDays: number }>;
}

export default function ShareOfferDialog({
  isOpen,
  onClose,
  offerId,
  onGenerateLink,
}: ShareOfferDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    if (!offerId) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const result = await onGenerateLink(offerId, 60);
      setShareLink(result.shareUrl);

      // Auto-copy to clipboard
      navigator.clipboard
        .writeText(result.shareUrl)
        .then(() => {
          setCopied(true);
          toast.success("Link copied to clipboard");
        })
        .catch(() => {
          toast.error("Failed to copy link");
        });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to generate share link");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareLink) return;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard");

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Offer</DialogTitle>
          <DialogDescription>
            Generate a shareable link for this offer that can be sent to
            clients.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            This link will expire after 60 days and can be shared with anyone.
          </div>

          {!shareLink ? (
            <Button
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>Generating link...</>
              ) : (
                <>
                  <LinkIcon size={16} className="mr-2" />
                  Generate Share Link
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Input value={shareLink} readOnly className="font-mono text-sm" />

              <div className="flex justify-between">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <Check size={14} className="mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setShareLink(null);
                    setCopied(false);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Generate New Link
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>This link will expire after 60 days.</p>
                <p>
                  Anyone with this link can view the offer without signing in.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
