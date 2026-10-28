import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";

export type EmailStatus =
  | "SENT"
  | "DELAYED"
  | "DELIVERED"
  | "OPENED"
  | "BOUNCED"
  | "COMPLAINED"
  | "FAILED";

export type EmailCategory =
  | "DOCUMENT"
  | "RECEIPT"
  | "EXPIRATION_ALERT"
  | "TICKET"
  | "LEGAL_PROCESS"
  | "BOUNCE_ALERT"
  | "OTHER";

export const emailStatusConfig: Record<
  EmailStatus,
  { label: string; color: string }
> = {
  SENT: { label: "Enviado", color: "blue" },
  DELAYED: { label: "Atrasado", color: "orange" },
  DELIVERED: { label: "Entregue", color: "green" },
  OPENED: { label: "Aberto", color: "cyan" },
  BOUNCED: { label: "Recusado", color: "red" },
  COMPLAINED: { label: "Marcado como spam", color: "volcano" },
  FAILED: { label: "Falhou", color: "red" },
};

export const emailCategoryLabels: Record<EmailCategory, string> = {
  DOCUMENT: "Envio de documentos",
  RECEIPT: "Comprovante de envio",
  EXPIRATION_ALERT: "Alerta de vencimento",
  TICKET: "Atendimento",
  LEGAL_PROCESS: "Processos",
  BOUNCE_ALERT: "Aviso de e-mail recusado",
  OTHER: "Outros",
};

export type EmailLog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  toEmail: string;
  subject: string;
  category: EmailCategory;
  status: EmailStatus;
  error: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  bouncedAt: string | null;
  tracked: boolean;
  sentBy: { id: string; name: string | null } | null;
  client: { id: string; name: string | null } | null;
};

export type EmailLogFilters = {
  from?: string;
  to?: string;
  status?: EmailStatus;
  category?: EmailCategory;
  clientId?: string;
};

export const listEmailLogs = async (
  filters: EmailLogFilters,
): Promise<EmailLog[]> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v),
  );
  const response = await axios.get(`${BASE_URL}/email-log`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params,
  });
  return response.data;
};
