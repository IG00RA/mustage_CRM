import { toast } from 'react-toastify';

export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;
};

export const getAuthHeaders = () => {
  const accessToken = getCookie('access_token');
  if (!accessToken) throw new Error('No access token found');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

export const fetchWithErrorHandling = async <T>(
  url: string,
  options: RequestInit,
  set: (state: Partial<any>) => void
): Promise<T> => {
  set({ loading: true, error: null });
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to fetch data from ${url}`);
    }
    const data: T = await response.json();
    set({ loading: false });
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    set({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
};
