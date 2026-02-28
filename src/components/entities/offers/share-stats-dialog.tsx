"use client";

import { useState, useCallback, useEffect } from "react";
import { Share2, Copy, ExternalLink, Clock, Eye, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/navigation/dialog";
import { Button } from "@/components/ui/primitives/button";
import { Alert, AlertDescription } from "@/components/ui/primitives/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import Spinner from "@/components/ui/primitives/spinner";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface ShareStatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
}

interface ShareLink {
  id: string;
  token: string;
  offer_id: string;
  created_at: string;
  created_by: string;
  expires_at: string;
  views: number;
  last_viewed_at: string | null;
  fullUrl: string;
}

export default function ShareStatsDialog({
  isOpen,
  onClose,
  offerId,
}: ShareStatsDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const fetchShareLinks = useCallback(async () => {
    if (!offerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/offers/${offerId}/share-stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch share statistics");
      }
      const links = await response.json();
      setShareLinks(links);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load share statistics"
      );
    } finally {
      setIsLoading(false);
    }
  }, [offerId]);

  // Fetch share links when the dialog opens
  useEffect(() => {
    if (isOpen && offerId) {
      fetchShareLinks();
    }
  }, [isOpen, offerId, fetchShareLinks]);

  const copyToClipboard = (linkId: string, url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedLinkId(linkId);
        toast.success("Link copied to clipboard");

        // Reset copied state after 2 seconds
        setTimeout(() => setCopiedLinkId(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // Format date for display
  const formatDate = (dateString: string) => formatDateTime(dateString);

  // Calculate days left until expiration
  const getDaysLeft = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Offer Share Statistics
          </DialogTitle>
          <DialogDescription>
            View statistics and manage share links for this offer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner className="w-8 h-8" />
          </div>
        ) : shareLinks.length === 0 ? (
          <div className="bg-muted rounded-md p-6 text-center">
            <p className="text-muted-foreground">
              No share links have been created for this offer yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Last Viewed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="text-sm">
                        {formatDate(link.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>{getDaysLeft(link.expires_at)} days left</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expires on {formatDate(link.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Eye size={14} className="text-muted-foreground" />
                          <span>{link.views || 0} views</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {link.last_viewed_at
                          ? formatDate(link.last_viewed_at)
                          : "Never viewed"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              copyToClipboard(link.id, link.fullUrl)
                            }
                            variant="outline"
                            size="sm"
                            title="Copy link to clipboard"
                          >
                            {copiedLinkId === link.id ? (
                              <>
                                <Check
                                  size={14}
                                  className="mr-1 text-green-500"
                                />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            title="Open in new tab"
                          >
                            <a
                              href={link.fullUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={14} className="mr-1" />
                              Open
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
              <p className="flex items-center gap-1">
                <Eye size={14} />
                View counts are updated each time the share link is opened.
              </p>
              <p className="flex items-center gap-1 mt-1">
                <Clock size={14} />
                All share links expire after 60 days from creation.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
