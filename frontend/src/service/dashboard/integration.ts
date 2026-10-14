import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type { DashboardResponse } from "./types";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
