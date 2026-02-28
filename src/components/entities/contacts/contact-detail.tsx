"use client";

import { Contact } from "@/lib/api/contacts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { ProfileImage } from "@/components/ui/data-display/profile-image";

import {
  ExternalLink,
  Mail,
  MapPin,
  Building,
  Calendar,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContactDetailProps {
  contact: Contact;
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const formatLocal = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <ProfileImage
              src={contact.profile_image_url}
              alt={contact.name}
              size="xl"
              fallback={contact.name}
            />
            <div>
              <h1 className="text-2xl font-bold">{contact.name}</h1>
              {contact.headline && (
                <p className="text-muted-foreground mt-1">{contact.headline}</p>
              )}
              {contact.company_role && (
                <p className="text-muted-foreground">{contact.company_role}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-lg font-semibold">{contact.name}</p>
            </div>

            {contact.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-lg">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {contact.email}
                  </a>
                </p>
              </div>
            )}

            {contact.company_role && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <p className="text-lg">{contact.company_role}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      {(contact.organization as any) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Organization Name
                </label>
                <p className="text-lg font-semibold">
                  {contact.organization!.name}
                </p>
              </div>
              {contact.organization!.country && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Country
                  </label>
                  <p className="text-lg">{contact.organization!.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      {(contact.location || contact.country) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contact.location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <p className="text-lg">{contact.location}</p>
                </div>
              )}
              {contact.country && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Country
                  </label>
                  <p className="text-lg">{contact.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* LinkedIn Information */}
      {(contact.linkedin_url || contact.headline) && (
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.linkedin_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  LinkedIn Profile
                </label>
                <p className="text-lg">
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                  >
                    View Profile
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </p>
              </div>
            )}

            {contact.headline && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Headline
                </label>
                <p className="text-lg">{contact.headline}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Characteristics - available as extension */}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-lg">{formatLocal(contact.created_at)}</p>
            </div>

            {contact.corporate_email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Work Email
                </label>
                <p className="text-lg">
                  <a
                    href={`mailto:${contact.corporate_email}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {contact.corporate_email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
