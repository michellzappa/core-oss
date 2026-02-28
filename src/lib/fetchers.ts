export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = `${response.status}: ${response.statusText}`;
    throw error;
  }

  return response.json();
};

export async function postFetcher(url: string, data: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = new Error('An error occurred while posting the data.');
    error.message = `${response.status}: ${response.statusText}`;
    throw error;
  }

  return response.json();
}

export async function putFetcher(url: string, data: unknown) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = new Error('An error occurred while updating the data.');
    error.message = `${response.status}: ${response.statusText}`;
    throw error;
  }

  return response.json();
}

export async function deleteFetcher(url: string) {
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = new Error('An error occurred while deleting the data.');
    error.message = `${response.status}: ${response.statusText}`;
    throw error;
  }

  return true;
}
