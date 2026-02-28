"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { Button } from "@/components/ui/primitives/button";
import { Badge } from "@/components/ui/primitives/badge";
import { Search, ExternalLink, Calendar, Mail, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getOfferDisplayLabel } from "@/lib/utils";

interface AccessLog {
  id: string;
  offer_id: string;
  accessed_email: string | null;
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  offer: {
    id: string;
    title: string;
    status: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface LogsResponse {
  logs: AccessLog[];
  pagination: Pagination;
}

export default function OfferAccessLogsList() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchOfferId, setSearchOfferId] = useState("");

  const fetchLogs = async (page = 1, email = "", offerId = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (email) params.append("email", email);
      if (offerId) params.append("offer_id", offerId);

      const response = await fetch(`/api/admin/offer-access-logs?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = () => {
    fetchLogs(1, searchEmail, searchOfferId);
  };

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage, searchEmail, searchOfferId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading access logs...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-sm text-destructive mb-4">{error}</div>
            <Button onClick={() => fetchLogs()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                placeholder="Filter by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Offer ID</label>
              <Input
                placeholder="Filter by offer ID..."
                value={searchOfferId}
                onChange={(e) => setSearchOfferId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="mb-0">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Access Logs ({pagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No access logs found
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {log.accessed_email || "Anonymous"}
                        </span>
                        {log.offer && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {getOfferDisplayLabel(log.offer)}
                            </span>
                            <Badge
                              className={`text-xs ${getStatusColor(
                                log.offer.status,
                              )}`}
                            >
                              {log.offer.status}
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(log.accessed_at), {
                            addSuffix: true,
                          })}
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip_address}
                          </div>
                        )}
                      </div>

                      {log.user_agent && (
                        <div className="text-xs text-muted-foreground truncate">
                          {log.user_agent}
                        </div>
                      )}
                    </div>

                    {log.offer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="ml-4"
                      >
                        <a
                          href={`/dashboard/offers/${log.offer.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
