"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/primitives/pagination";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Show up to 7 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Always show pagination, but in a simplified "blank state" when not needed
  if (totalPages <= 1) {
    return (
      <div
        className={cn("flex items-center justify-between px-2 py-4", className)}
      >
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span>
            {totalItems.toLocaleString()}{" "}
            {totalItems === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div></div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-between px-2 py-4", className)}
    >
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <span>
          Showing {startItem} to {endItem} of {totalItems.toLocaleString()}{" "}
          entries
        </span>
      </div>

      <UIPagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={cn(
                currentPage === 1 &&
                  "pointer-events-none opacity-50 hover:bg-transparent",
              )}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const pageNum = page as number;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={pageNum === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(pageNum);
                  }}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={cn(
                currentPage === totalPages &&
                  "pointer-events-none opacity-50 hover:bg-transparent",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </UIPagination>
    </div>
  );
}
