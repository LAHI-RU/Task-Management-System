const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  public readonly status: number;

  public readonly issues?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, issues?: Array<{ path: string; message: string }>) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export const apiRequest = async <TResponse>(
  path: string,
  options: ApiOptions = {},
) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Request failed.',
      response.status,
      data?.issues,
    );
  }

  return data as TResponse;
};
