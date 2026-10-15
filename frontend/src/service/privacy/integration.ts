import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";

export type PrivacyStatus = {
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: string | null;
  mustAccept: boolean;
};

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getPrivacyStatus = async (): Promise<PrivacyStatus> => {
  const response = await axios.get(`${BASE_URL}/privacy/status`, authHeaders());
  return response.data;
};

export const acceptTerms = async (version: string): Promise<PrivacyStatus> => {
  const response = await axios.post(`${BASE_URL}/privacy/accept`, { version }, authHeaders());
  return response.data;
};

export const getMyData = async (): Promise<unknown> => {
  const response = await axios.get(`${BASE_URL}/privacy/my-data`, authHeaders());
  return response.data;
};
