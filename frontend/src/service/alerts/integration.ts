import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";

export type ExpirationAlertsResult = {
  date: string;
  documentsDue: number;
  clientEmailsSent: number;
  officeEmailSent: boolean;
  clientsWithoutEmail: string[];
  failures: string[];
};

export const runExpirationAlerts = async (): Promise<ExpirationAlertsResult> => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_URL}/alerts/expiration/run`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
