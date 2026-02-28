"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { Label } from "@/components/ui/primitives/label";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { ConfirmDialog } from "@/components/ui/navigation";

interface PaymentTerm {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

export default function PaymentTermsList() {
  const [items, setItems] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PaymentTerm | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/payment-terms", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load payment terms");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing({
      id: "",
      title: "",
      description: "",
      is_active: true,
      is_default: false,
    });
    setShowForm(true);
  }

  function startEdit(item: PaymentTerm) {
    setEditing(item);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/settings/payment-terms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (e) {
      console.error(e);
      setError("Failed to delete");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      is_active: form.get("is_active") === "on",
      is_default: form.get("is_default") === "on",
    };
    try {
      const res = await fetch(
        "/api/settings/payment-terms" + (editing?.id ? `/${editing.id}` : ""),
        {
          method: editing?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Save failed");
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      setError("Failed to save");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Payment Terms
        </h2>
        <button
          onClick={startCreate}
          className="minimal-button px-3 py-1.5 text-sm flex items-center gap-1"
        >
          <Plus size={16} /> New
        </button>
      </div>
      {showForm && editing && (
        <div className="bg-white dark:bg-[var(--card)] minimal-shadow minimal-border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editing.id ? "Edit Payment Term" : "Add Payment Term"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="text-[var(--gray-600)] hover:text-[var(--gray-900)]"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                name="title"
                id="title"
                defaultValue={editing.title}
                placeholder="e.g. Net 30"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                id="description"
                defaultValue={editing.description}
                rows={5}
                placeholder="Markdown-friendly terms"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  defaultChecked={editing.is_active}
                />
                <span>Active</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox
                  id="is_default"
                  name="is_default"
                  defaultChecked={editing.is_default}
                />
                <span>Default</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="minimal-button px-3 py-1.5 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="minimal-button-outline px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {loading ? (
        <PageLoader variant="block" />
      ) : error ? (
        <div className="p-4 text-sm text-red-500">{error}</div>
      ) : (
        <div className="bg-[var(--card)] minimal-shadow minimal-border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-[var(--accent)]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                    {it.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                    {it.is_default ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                    {it.is_active ? "Enabled" : "Disabled"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[var(--foreground)]">
                    <button
                      type="button"
                      onClick={() => startEdit(it)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] mr-3"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(it.id)}
                      className="text-[var(--muted-foreground)] hover:text-red-500"
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
        title="Delete payment term?"
        description="This will remove the payment term from your settings. This action cannot be undone."
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
      {/* form intentionally above table */}
    </div>
  );
}
