"use client";

import { useState, useEffect } from "react";
import { CorporateEntity } from "@/lib/types";
import { Edit, Trash2, Plus } from "lucide-react";
import CorporateEntityForm from "./corporate-entity-form";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { ConfirmDialog } from "@/components/ui/navigation";

export default function CorporateEntitiesList() {
  const [entities, setEntities] = useState<CorporateEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<CorporateEntity | null>(
    null,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/corporate-entities");

      if (!response.ok) {
        throw new Error("Failed to fetch corporate entities");
      }

      const data = await response.json();
      setEntities(data);
      setError(null);
    } catch (err) {
      setError("Error loading corporate entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entity: CorporateEntity) => {
    setCurrentEntity(entity);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/corporate-entities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete corporate entity");
      }

      // Refresh the list
      fetchEntities();
    } catch (err) {
      setError("Error deleting corporate entity");
      console.error(err);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setCurrentEntity(null);
  };

  const handleFormSubmit = () => {
    fetchEntities();
    handleFormClose();
  };

  const handleAddNew = () => {
    setCurrentEntity(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return <PageLoader variant="block" />;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Corporate Entities
        </h2>
        <button
          onClick={handleAddNew}
          className="minimal-button px-3 py-1.5 text-sm flex items-center gap-1"
        >
          <Plus size={16} />
          Add Entity
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-[var(--card)] minimal-shadow minimal-border rounded-md p-6">
          <CorporateEntityForm
            entity={currentEntity}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {entities.length === 0 ? (
        <div className="bg-card minimal-shadow minimal-border rounded-md p-6 text-center">
          <p className="text-[var(--gray-600)]">No corporate entities found</p>
          <button
            onClick={handleAddNew}
            className="minimal-button-outline mt-4 px-3 py-1.5 text-sm"
          >
            Add your first corporate entity
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 minimal-shadow minimal-border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Legal Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  VAT ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              {entities.map((entity) => (
                <tr
                  key={entity.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {entity.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {entity.legal_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {entity.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {entity.vat_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(entity)}
                      className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mr-3"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(entity.id)}
                      className="text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete corporate entity?"
        description="This will remove the corporate entity from your settings. This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={
          pendingDeleteId ? () => handleDelete(pendingDeleteId) : () => {}
        }
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null);
          }
        }}
      />
    </div>
  );
}
