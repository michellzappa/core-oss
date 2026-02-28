"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { swrDefaultConfig } from "@/lib/swr-config";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrDefaultConfig}>{children}</SWRConfig>;
}
