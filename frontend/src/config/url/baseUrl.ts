export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? import.meta.env.VITE_API_LOCAL
    : import.meta.env.VITE_API_PROD);
