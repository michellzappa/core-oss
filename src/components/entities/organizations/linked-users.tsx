"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import LinkedData, {
  LinkedDataEmptyState,
} from "@/components/ui/composite/linked-data";
import { Button } from "@/components/ui/primitives/button";
import { Edit, ExternalLink, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  company_role?: string;
  created_at: string;
  country?: string;
}

interface LinkedContactsProps {
  organizationId: string;
}

export default function LinkedContacts({
  organizationId,
}: LinkedContactsProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("organization_id", organizationId)
          .order("name");

        if (error) {
          console.error("Error fetching contacts:", error);
          setError("Failed to load contacts");
        } else {
          setContacts(data || []);
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    }

    if (organizationId) {
      fetchContacts();
    }
  }, [organizationId]);

  const handleCreateContact = () => {
    router.push(`/dashboard/contacts/new?organization_id=${organizationId}`);
  };

  const handleEditContact = (contactId: string) => {
    router.push(`/dashboard/contacts/${contactId}`);
  };

  const handleViewContact = (contactId: string) => {
    router.push(`/dashboard/contacts/${contactId}`);
  };

  const formatLocal = (dateString: string) => formatDate(dateString);

  if (error) {
    return (
      <LinkedData title="Linked Contacts">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading contacts: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </LinkedData>
    );
  }

  return (
    <LinkedData
      title="Linked Contacts"
      subtitle={`${contacts.length} contact${
        contacts.length !== 1 ? "s" : ""
      } associated with this organization`}
      onAddNew={handleCreateContact}
      addButtonText="Add Contact"
      isLoading={isLoading}
    >
      {contacts.length === 0 ? (
        <LinkedDataEmptyState
          title="No contacts yet"
          description="Add contacts to this organization to get started."
          actionText="Add Contact"
          onAction={handleCreateContact}
        />
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                      {contact.name}
                    </h4>
                    {contact.company_role && (
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                        {contact.company_role}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-neutral-500">
                    <span className="truncate">{contact.email}</span>
                    {contact.country && <span>{contact.country}</span>}
                    <span>Joined: {formatLocal(contact.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewContact(contact.id)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditContact(contact.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </LinkedData>
  );
}
