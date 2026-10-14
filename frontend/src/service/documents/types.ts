import type { DocumentCategoryEnum } from "../../common/enum/document-category.enum";
import type { DocumentTypeEnum } from "../../common/enum/document-type.enum";

export type DocumentTypeResponse = {
  id: string;
  code: DocumentTypeEnum;
  name: string;
  category: DocumentCategoryEnum;
  requiresExpiration: boolean;
  defaultAlertDays: number | null;
  active: boolean;
};

export type CreateDocumentTypePayload = {
  code: DocumentTypeEnum;
  name: string;
  category: DocumentCategoryEnum;
  requiresExpiration?: boolean;
  defaultAlertDays?: number;
};

export type DocumentResponse = {
  id: string;
  title: string;
  number: string | null;
  notes: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  alertDays: number | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: string | null;
  active: boolean;
  visibleToClient: boolean;
};

export type CreateDocumentPayload = {
  clientId: string;
  documentTypeId: string;
  title: string;
  number?: string;
  notes?: string;
  issueDate?: string;
  expirationDate?: string;
  alertDays?: number;
  visibleToClient?: boolean;
  file?: File;
};

export type NotifyDocumentsResult = {
  sent: { client: string; email: string; documents: number; attached: number }[];
  skipped: { client: string; reason: string }[];
  failed: { client: string; reason: string }[];
};

export type DownloadFormat = "xml" | "pdf";

export type DocumentListItem = {
  id: string;
  title: string;
  number: string | null;
  notes: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  alertDays: number | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: string | null;
  hasFile: boolean;
  isXml: boolean;
  visibleToClient: boolean;
  createdAt: string;
  client: {
    id: string;
    name: string;
    cnpj: string;
  };
  documentType: {
    id: string;
    code: DocumentTypeEnum;
    name: string;
    category: DocumentCategoryEnum;
  };
};
