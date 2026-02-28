"use client";

import { useState } from "react";
import { CorporateEntity } from "@/lib/types";
import { X } from "lucide-react";
import { toast } from "sonner";

interface CorporateEntityFormProps {
  entity: CorporateEntity | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CorporateEntityForm({
  entity,
  onClose,
  onSubmit,
}: CorporateEntityFormProps) {
  const [formData, setFormData] = useState<Partial<CorporateEntity>>(
    entity || {
      name: "",
      legal_name: "",
      address: "",
      city: "",
      postcode: "",
      country: "",
      vat_id: "",
      tax_id: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = entity
        ? `/api/corporate-entities/${entity.id}`
        : "/api/corporate-entities";
      const method = entity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save corporate entity");
      }

      toast.success(
        entity
          ? "Corporate entity updated successfully"
          : "Corporate entity created successfully"
      );
      onSubmit();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(
        `Failed to ${
          entity ? "update" : "create"
        } corporate entity: ${errorMessage}`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
          <div className="bg-card minimal-shadow minimal-border rounded-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[var(--foreground)]">
          {entity ? "Edit Corporate Entity" : "Add Corporate Entity"}
        </h3>
        <button
          onClick={onClose}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="legal_name"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Legal Name *
            </label>
            <input
              type="text"
              id="legal_name"
              name="legal_name"
              value={formData.legal_name || ""}
              onChange={handleChange}
              required
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="postcode"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={formData.postcode || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="vat_id"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              VAT ID
            </label>
            <input
              type="text"
              id="vat_id"
              name="vat_id"
              value={formData.vat_id || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="tax_id"
              className="block text-sm font-medium text-[var(--gray-700)]"
            >
              Tax ID
            </label>
            <input
              type="text"
              id="tax_id"
              name="tax_id"
              value={formData.tax_id || ""}
              onChange={handleChange}
              className="minimal-input mt-1 block w-full"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--accent-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
            disabled={loading}
          >
            {loading ? "Saving..." : entity ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
