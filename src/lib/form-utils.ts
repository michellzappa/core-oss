import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

export async function handleCreateSubmission<T>(
  formData: T,
  apiEndpoint: string,
  entityName: string,
  router: Router,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  backLink?: string
): Promise<void> {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || `Failed to create ${entityName}`
      );
    }

    toast.success(`${entityName} created successfully`);

    const navigateTo = backLink || window.location.pathname.split("/new")[0];
    router.push(navigateTo);
    router.refresh();
  } catch (err) {
    console.error(`Error creating ${entityName}:`, err);
    const errorMessage =
      err instanceof Error ? err.message : `Failed to create ${entityName}`;
    setError(errorMessage);
    toast.error(`Failed to create ${entityName}: ${errorMessage}`);
    setLoading(false);
  }
}

export async function handleUpdateSubmission<T>(
  id: string,
  formData: T,
  apiEndpoint: string,
  entityName: string,
  router: Router,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  backLink?: string
): Promise<void> {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${apiEndpoint}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || `Failed to update ${entityName}`
      );
    }

    toast.success(`${entityName} updated successfully`);

    const navigateTo = backLink || window.location.pathname.split("/edit")[0];
    router.push(navigateTo);
    router.refresh();
  } catch (err) {
    console.error(`Error updating ${entityName}:`, err);
    const errorMessage =
      err instanceof Error ? err.message : `Failed to update ${entityName}`;
    setError(errorMessage);
    toast.error(`Failed to update ${entityName}: ${errorMessage}`);
    setLoading(false);
  }
}

export async function handleDeleteSubmission(
  id: string,
  apiEndpoint: string,
  entityName: string,
  router: Router,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  backLink?: string
): Promise<void> {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${apiEndpoint}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to delete ${entityName}`
      );
    }

    toast.success(`${entityName} deleted successfully`);

    const navigateTo = backLink || window.location.pathname.split(`/${id}`)[0];
    router.push(navigateTo);
    router.refresh();
  } catch (err) {
    console.error(`Error deleting ${entityName}:`, err);
    const errorMessage =
      err instanceof Error ? err.message : `Failed to delete ${entityName}`;
    setError(errorMessage);
    toast.error(`Failed to delete ${entityName}: ${errorMessage}`);
    setLoading(false);
  }
}
