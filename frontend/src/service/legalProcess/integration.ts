import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type {
  CreateLegalProcessPayload,
  LegalProcess,
  UpdateLegalProcessPayload,
} from "./types";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const listLegalProcesses = async (): Promise<LegalProcess[]> => {
  const response = await axios.get(`${BASE_URL}/legal-process`, authHeaders());
  return response.data;
};

export const createLegalProcess = async (
  payload: CreateLegalProcessPayload,
): Promise<LegalProcess> => {
  const response = await axios.post(`${BASE_URL}/legal-process`, payload, authHeaders());
  return response.data;
};

export const updateLegalProcess = async (
  id: string,
  payload: UpdateLegalProcessPayload,
): Promise<LegalProcess> => {
  const response = await axios.patch(
    `${BASE_URL}/legal-process/${id}`,
    payload,
    authHeaders(),
  );
  return response.data;
};

export const addLegalProcessStep = async (
  id: string,
  name: string,
): Promise<LegalProcess> => {
  const response = await axios.post(
    `${BASE_URL}/legal-process/${id}/steps`,
    { name },
    authHeaders(),
  );
  return response.data;
};

export const updateLegalProcessStep = async (
  id: string,
  stepId: string,
  payload: { done?: boolean; notes?: string },
): Promise<LegalProcess> => {
  const response = await axios.patch(
    `${BASE_URL}/legal-process/${id}/steps/${stepId}`,
    payload,
    authHeaders(),
  );
  return response.data;
};

export const deleteLegalProcess = async (id: string) => {
  const response = await axios.delete(`${BASE_URL}/legal-process/${id}`, authHeaders());
  return response.data;
};
