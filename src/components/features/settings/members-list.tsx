"use client";

import { useState, useEffect } from "react";
import { User, Calendar, Mail, Clock } from "lucide-react";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { formatDateTime } from "@/lib/utils";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  display_name: string;
}

export default function MembersList() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string>("");
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/users");

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch {
      setError("Error loading members");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: AuthUser) => {
    setEditingId(user.id);
    setPendingName(user.display_name || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPendingName("");
  };

  const saveName = async (user: AuthUser) => {
    try {
      setSaving(user.id);
      const resp = await fetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: pendingName }),
      });
      if (!resp.ok) throw new Error("Failed to update name");
      const updated = await resp.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, display_name: updated.display_name } : u,
        ),
      );
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert("Failed to update name");
    } finally {
      setSaving(null);
    }
  };

  const formatDateLocal = (dateString: string | null) => {
    if (!dateString) return "Never";
    return formatDateTime(dateString);
  };

  const getStatusColor = (
    lastSignIn: string | null,
    emailConfirmed: string | null,
  ) => {
    if (!emailConfirmed)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (!lastSignIn)
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200";

    try {
      const lastSignInDate = new Date(lastSignIn);
      const daysSinceLastSignIn =
        (Date.now() - lastSignInDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastSignIn < 7)
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      if (daysSinceLastSignIn < 30)
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    } catch {
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200";
    }
  };

  const getStatusText = (
    lastSignIn: string | null,
    emailConfirmed: string | null,
  ) => {
    if (!emailConfirmed) return "Unverified";
    if (!lastSignIn) return "Never signed in";

    try {
      const lastSignInDate = new Date(lastSignIn);
      const daysSinceLastSignIn =
        (Date.now() - lastSignInDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastSignIn < 1) return "Active today";
      if (daysSinceLastSignIn < 7) return "Active this week";
      if (daysSinceLastSignIn < 30) return "Active this month";
      return "Inactive";
    } catch {
      return "Unknown";
    }
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
          Members
        </h2>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {users.length} authenticated user{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-card minimal-shadow minimal-border rounded-md p-6 text-center">
          <p className="text-[var(--gray-600)]">No authenticated users found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 minimal-shadow minimal-border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Last Sign In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Member Since
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                      </div>
                      <div className="ml-4">
                        {editingId === user.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={pendingName}
                              onChange={(e) => setPendingName(e.target.value)}
                              className="h-8 px-2 rounded-md border bg-card text-sm"
                              placeholder="Display name"
                              disabled={saving === user.id}
                            />
                            <button
                              onClick={() => saveName(user)}
                              className="text-sm px-2 h-8 rounded bg-black text-white disabled:opacity-50"
                              disabled={
                                saving === user.id || !pendingName.trim()
                              }
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-sm px-2 h-8 rounded minimal-border"
                              disabled={saving === user.id}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {user.display_name}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {((user.user_metadata as Record<string, unknown>)
                                ?.role as string) || "Member"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-900 dark:text-neutral-100">
                      <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingId === user.id ? null : (
                      <button
                        onClick={() => startEdit(user)}
                        className="text-sm px-2 h-8 rounded minimal-border"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        user.last_sign_in_at,
                        user.email_confirmed_at,
                      )}`}
                    >
                      {getStatusText(
                        user.last_sign_in_at,
                        user.email_confirmed_at,
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-900 dark:text-neutral-100">
                      <Clock className="h-4 w-4 mr-2 text-neutral-400" />
                      {formatDateLocal(user.last_sign_in_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-900 dark:text-neutral-100">
                      <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                      {formatDateLocal(user.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
