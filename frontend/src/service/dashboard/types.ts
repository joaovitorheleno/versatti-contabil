import type { DocumentCategoryEnum } from "../../common/enum/document-category.enum";

export type DocumentStatus = "EXPIRED" | "EXPIRING" | "VALID" | "NO_EXPIRATION";

export type DashboardResponse = {
  summary: {
    totalDocuments: number;
    expired: number;
    expiring: number;
    sentThisMonth: number;
    sentLastMonth: number;
    activeClients: number;
  };
  statusDistribution: { status: DocumentStatus; count: number }[];
  expirationsByMonth: { month: string; count: number }[];
  uploadsByMonth: { month: string; count: number }[];
  byCategory: { category: DocumentCategoryEnum; count: number }[];
  clientsWithPending: {
    clientId: string;
    name: string;
    cnpj: string;
    expired: number;
    expiring: number;
  }[];
};
