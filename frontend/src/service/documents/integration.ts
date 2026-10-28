import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type {
  CreateDocumentPayload,
  CreateDocumentTypePayload,
  DocumentListItem,
  DocumentResponse,
  DocumentTypeResponse,
  DownloadFormat,
  NotifyDocumentsOptions,
  NotifyDocumentsResult,
} from "./types";

export const createDocument = async (
  newDocument: CreateDocumentPayload,
): Promise<DocumentResponse> => {
  const token = getToken();

  const { file, ...fields } = newDocument;

  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });

  if (file) {
    formData.append("file", file);
  }

  const response = await axios.post(`${BASE_URL}/document`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const notifyDocuments = async (
  documentIds: string[],
  options: NotifyDocumentsOptions,
): Promise<NotifyDocumentsResult> => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/document/notify`,
    { documentIds, ...options },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const listDocuments = async (
  clientId?: string,
): Promise<DocumentListItem[]> => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/document`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: clientId ? { clientId } : undefined,
  });

  return response.data;
};

export const getDocumentFile = async (
  documentId: string,
  format?: DownloadFormat,
): Promise<Blob> => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/document/${documentId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: format ? { format } : undefined,
    responseType: "blob",
  });

  return response.data;
};

export const listDocumentTypes = async (): Promise<DocumentTypeResponse[]> => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/document/type`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteDocumentType = async (id: string) => {
  const token = getToken();

  const response = await axios.delete(`${BASE_URL}/document/type/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createDocumentType = async (
  newDocumentType: CreateDocumentTypePayload,
): Promise<DocumentTypeResponse> => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/document/type`,
    newDocumentType,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
