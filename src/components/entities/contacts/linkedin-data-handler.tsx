"use client";

import { useEffect, useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { countries } from "@/lib/data/countries";

interface LinkedInData {
  name?: string;
  headline?: string;
  company_role?: string;
  location?: string;
  country?: string;
  email?: string;
  linkedin_url?: string;
  // New field names (with underscore prefix)
  _additional_info?: string;
  _connection_count?: string;
  _profile_image_url?: string;
  _company?: string;
  // Old field names (for backward compatibility)
  company?: string;
  connection_count?: string;
  profile_image_url?: string;
  type?: string;
  // Organization fields
  industry?: string;
  size?: string;
  founded?: string;
  hq_location?: string;
  company_type?: string;
  website?: string;
  logo_image_url?: string;
  notes?: string;
}

interface LinkedInDataHandlerProps {
  onDataReceived: (data: Record<string, unknown>) => void;
  entityType?: "contact" | "organization";
}

// Function to convert country name to country code
function getCountryCode(countryName: string): string {
  if (!countryName) return "";

  // Try exact match first
  const exactMatch = countries.find(
    (country) => country.name.toLowerCase() === countryName.toLowerCase()
  );
  if (exactMatch) return exactMatch.code;

  // Try partial match for common variations
  const partialMatch = countries.find(
    (country) =>
      countryName.toLowerCase().includes(country.name.toLowerCase()) ||
      country.name.toLowerCase().includes(countryName.toLowerCase())
  );
  if (partialMatch) return partialMatch.code;

  // Return empty string if no match found
  return "";
}

export function LinkedInDataHandler({
  onDataReceived,
  entityType = "contact",
}: LinkedInDataHandlerProps) {
  const [linkedinParam, setLinkedinParam] = useQueryState(
    "linkedin_data",
    parseAsString
  );
  const [hasProcessedData, setHasProcessedData] = useState(false);

  useEffect(() => {
    console.log(
      "LinkedIn Data Handler - useEffect triggered, hasProcessedData:",
      hasProcessedData
    );
    if (hasProcessedData) return;

    console.log(
      "LinkedIn Data Handler - Checking for linkedin_data param:",
      !!linkedinParam
    );

    if (linkedinParam) {
      try {
        console.log("LinkedIn Data Handler - Raw data:", linkedinParam);
        const decodedData = JSON.parse(
          decodeURIComponent(linkedinParam)
        ) as LinkedInData;
        console.log("LinkedIn Data Handler - Decoded data:", decodedData);

        let transformedData: Record<string, unknown> = {};

        if (entityType === "contact") {
          // Convert country name to country code
          const countryCode = getCountryCode(decodedData.country || "");
          console.log(
            `Converting country "${decodedData.country}" to code "${countryCode}"`
          );

          // Transform LinkedIn data to match contact form fields
          transformedData = {
            name: decodedData.name || "",
            headline: decodedData.headline || "",
            company_role: decodedData.company_role || "",
            location: decodedData.location || "",
            country: countryCode, // Use country code instead of full name
            email: decodedData.email || "",
            linkedin_url: decodedData.linkedin_url || "",
            profile_image_url:
              decodedData.profile_image_url ||
              decodedData._profile_image_url ||
              "",
          };
        } else if (entityType === "organization") {
          // Convert country name to country code for organizations too
          const countryCode = getCountryCode(decodedData.country || "");
          console.log(
            `Converting country "${decodedData.country}" to code "${countryCode}"`
          );

          // Transform LinkedIn data to match organization form fields
          transformedData = {
            name: decodedData.name || "",
            industry: decodedData.industry || "",
            size: decodedData.size || "",
            founded: decodedData.founded || "",
            hq_location: decodedData.hq_location || "",
            country: countryCode, // Use country code instead of full name
            company_type: decodedData.company_type || "",
            website: decodedData.website || "",
            linkedin_url: decodedData.linkedin_url || "",
            logo_image_url: decodedData.logo_image_url || "",
            notes: decodedData.notes || "",
          };
        }

        console.log(
          "LinkedIn Data Handler - Transformed data:",
          transformedData
        );

        // Pass the transformed data to the parent component
        onDataReceived(transformedData);
        setHasProcessedData(true);

        // Don't clear the URL parameter immediately - let the form process it first
        // We'll clear it after a delay to ensure the form has time to receive the data
        setTimeout(() => {
          setLinkedinParam(null);
        }, 2000);
      } catch (error) {
        console.error("Error parsing LinkedIn data:", error);
      }
    }
  }, [
    linkedinParam,
    onDataReceived,
    hasProcessedData,
    setLinkedinParam,
    entityType,
  ]);

  return (
    <div style={{ display: "none" }}>
      LinkedIn Data Handler Loaded - hasProcessedData:{" "}
      {hasProcessedData.toString()}
    </div>
  );
}
