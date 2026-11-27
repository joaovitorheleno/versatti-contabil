import { maskCPF } from "./maskCpf";

const looksLikeEmail = (value: string) => /[a-zA-Z@]/.test(value);

export const maskLogin = (value: unknown) => {
  const text = String(value ?? "");
  if (!looksLikeEmail(text)) return maskCPF(text);
  return text.trim().replace(/^(\d{3})\.(\d{1,3})(?:\.(\d{1,3}))?(?:-(\d{1,2}))?(?=\D)/, "$1$2$3$4");
};

export const normalizeLogin = (value: string) =>
  looksLikeEmail(value) ? value.trim().toLowerCase() : value.replace(/\D/g, "");
