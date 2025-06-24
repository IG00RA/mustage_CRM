export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;
};

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.NEXT_PUBLIC_LOCAL === 'local') {
    const accessToken = getCookie('access_token');
    if (!accessToken) throw new Error('No access token found');
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

interface StateType {
  loading?: boolean;
  error?: null | string;
}

interface ErrorDetail {
  loc: (string | number)[];
  msg: string;
}

interface ErrorResponse {
  detail: ErrorDetail[] | string;
}

interface CustomError extends Error {
  response?: ErrorResponse;
}

export const fetchWithErrorHandling = async <T>(
  url: string,
  options: RequestInit,
  set: (state: StateType) => void
): Promise<T> => {
  set({ loading: true, error: null });

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      let detailMessage = `Request failed with status ${response.status}`;

      if (response.status === 422 && Array.isArray(errorData.detail)) {
        detailMessage = errorData.detail
          .map((err: ErrorDetail) => {
            const path = Array.isArray(err.loc) ? err.loc.join(', ') : '';
            return `${err.msg}: ${path}`;
          })
          .join('\n');
      } else if (typeof errorData.detail === 'string') {
        detailMessage = errorData.detail;
      }

      const error: CustomError = new Error(detailMessage);
      error.response = errorData;
      throw error;
    }

    if (response.status === 204) {
      set({ loading: false });
      return {} as T;
    }

    const data: T = await response.json();
    set({ loading: false });
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    set({ loading: false, error: errorMessage });

    throw errorMessage;
  }
};
