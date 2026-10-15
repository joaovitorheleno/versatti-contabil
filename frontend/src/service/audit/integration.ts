import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "DOCUMENT_UPLOAD"
  | "DOCUMENT_DOWNLOAD"
  | "TICKET_ATTACHMENT_DOWNLOAD"
  | "TERMS_ACCEPTED"
  | "PERSONAL_DATA_EXPORT";

export const auditActionLabels: Record<AuditAction, string> = {
  LOGIN: "Login",
  LOGIN_FAILED: "Tentativa de login falhou",
  DOCUMENT_UPLOAD: "Envio de documento",
  DOCUMENT_DOWNLOAD: "Download de documento",
  TICKET_ATTACHMENT_DOWNLOAD: "Download de anexo de chamado",
  TERMS_ACCEPTED: "Aceite dos termos",
  PERSONAL_DATA_EXPORT: "Exportação dos próprios dados",
};

export type AuditLog = {
  id: string;
  createdAt: string;
  action: AuditAction;
  user: { id: string; name: string | null } | null;
  client: { id: string; name: string | null } | null;
  entityId: string | null;
  description: string | null;
  ip: string | null;
  userAgent: string | null;
};

export type AuditFilters = {
  from?: string;
  to?: string;
  action?: AuditAction;
  clientId?: string;
};

export const listAuditLogs = async (filters: AuditFilters): Promise<AuditLog[]> => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const response = await axios.get(`${BASE_URL}/audit`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params,
  });
  return response.data;
};
