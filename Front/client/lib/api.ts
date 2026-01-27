export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const apiUrl = (path: string) => {
  if (!apiBaseUrl) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

type ApiFetchOptions = RequestInit & { timeoutMs?: number };

export const apiFetch = async (path: string, options?: ApiFetchOptions) => {
  const timeoutMs = options?.timeoutMs ?? 8000;
  if (options?.signal) {
    return fetch(apiUrl(path), options);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(apiUrl(path), { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const readJsonSafe = async <T = any>(response: Response): Promise<T | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const readErrorMessage = async (response: Response, fallback: string) => {
  const data = await readJsonSafe<{ error?: string; message?: string }>(response);
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  const text = await response.text().catch(() => "");
  return text || fallback;
};
