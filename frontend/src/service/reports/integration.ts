import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type {
  ComplianceReport,
  ExpirationReportRow,
  ReportFilters,
  UploadReportRow,
} from "./types";

const getReport = async <T>(path: string, filters: ReportFilters): Promise<T> => {
  const token = getToken();

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value),
  );

  const response = await axios.get(`${BASE_URL}/report/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

export const getExpirationReport = (filters: ReportFilters) =>
  getReport<ExpirationReportRow[]>("expirations", filters);

export const getComplianceReport = (filters: ReportFilters) =>
  getReport<ComplianceReport>("compliance", filters);

export const getUploadReport = (filters: ReportFilters) =>
  getReport<UploadReportRow[]>("uploads", filters);
