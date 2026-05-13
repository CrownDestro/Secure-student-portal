const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),

  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      method:      'POST',
      credentials: 'include',
      body:        formData, // no Content-Type header — browser sets multipart boundary
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data as T;
  },
};
