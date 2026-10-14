import type { DocumentCategoryEnum } from "../../common/enum/document-category.enum";

export type ReportFilters = {
  from?: string;
  to?: string;
  clientId?: string;
  category?: DocumentCategoryEnum;
};

type ReportClient = { id: string; name: string; cnpj: string };

export type DocumentStatus = "EXPIRED" | "EXPIRING" | "VALID" | "NO_EXPIRATION";

export type ComplianceStatus = "EXPIRED" | "EXPIRING" | "VALID" | "MISSING";

export type ExpirationReportRow = {
  id: string;
  client: ReportClient;
  documentType: string;
  category: DocumentCategoryEnum;
  title: string;
  number: string | null;
  expirationDate: string;
  daysLeft: number;
  status: DocumentStatus;
};

export type ComplianceReport = {
  types: string[];
  clients: {
    client: ReportClient;
    valid: number;
    expiring: number;
    expired: number;
    missing: number;
    items: {
      documentType: string;
      category: DocumentCategoryEnum;
      status: ComplianceStatus;
      expirationDate: string | null;
      documentTitle: string | null;
    }[];
  }[];
};

export type UploadReportRow = {
  id: string;
  createdAt: string;
  client: ReportClient;
  documentType: string;
  category: DocumentCategoryEnum;
  title: string;
  fileName: string | null;
  uploadedBy: string | null;
  uploadedByOffice: boolean | null;
  visibleToClient: boolean;
};
