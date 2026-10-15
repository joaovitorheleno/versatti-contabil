import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type { TicketStatusEnum } from "../../common/enum/ticket.enum";
import type { CreateTicketPayload, TicketDetail, TicketSummary } from "./types";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const toFormData = (fields: Record<string, string | undefined>, file?: File) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  if (file) formData.append("file", file);
  return formData;
};

export const listTickets = async (): Promise<TicketSummary[]> => {
  const response = await axios.get(`${BASE_URL}/ticket`, authHeaders());
  return response.data;
};

export const getTicket = async (id: string): Promise<TicketDetail> => {
  const response = await axios.get(`${BASE_URL}/ticket/${id}`, authHeaders());
  return response.data;
};

export const createTicket = async ({
  file,
  ...fields
}: CreateTicketPayload): Promise<TicketDetail> => {
  const response = await axios.post(
    `${BASE_URL}/ticket`,
    toFormData(fields, file),
    authHeaders(),
  );
  return response.data;
};

export const replyTicket = async (
  id: string,
  message: string,
  file?: File,
): Promise<TicketDetail> => {
  const response = await axios.post(
    `${BASE_URL}/ticket/${id}/messages`,
    toFormData({ message }, file),
    authHeaders(),
  );
  return response.data;
};

export const updateTicketStatus = async (
  id: string,
  status: TicketStatusEnum,
): Promise<TicketDetail> => {
  const response = await axios.patch(
    `${BASE_URL}/ticket/${id}/status`,
    { status },
    authHeaders(),
  );
  return response.data;
};

export const getTicketAttachment = async (id: string, messageId: string): Promise<Blob> => {
  const response = await axios.get(`${BASE_URL}/ticket/${id}/messages/${messageId}/file`, {
    ...authHeaders(),
    responseType: "blob",
  });
  return response.data;
};
