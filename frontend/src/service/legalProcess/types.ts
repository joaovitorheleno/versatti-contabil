import type {
  LegalProcessStatusEnum,
  LegalProcessTypeEnum,
} from "../../common/enum/legal-process.enum";

export type LegalProcessStep = {
  id: string;
  position: number;
  name: string;
  done: boolean;
  doneAt: string | null;
  notes: string | null;
};

export type LegalProcess = {
  id: string;
  type: LegalProcessTypeEnum;
  title: string;
  description: string | null;
  status: LegalProcessStatusEnum;
  expectedEndDate: string | null;
  finishedAt: string | null;
  createdAt: string;
  client: { id: string; name: string; cnpj: string };
  progress: { done: number; total: number };
  steps: LegalProcessStep[];
};

export type CreateLegalProcessPayload = {
  clientId: string;
  type: LegalProcessTypeEnum;
  title: string;
  description?: string;
  expectedEndDate?: string;
};

export type UpdateLegalProcessPayload = {
  title?: string;
  description?: string;
  status?: LegalProcessStatusEnum;
  expectedEndDate?: string;
};
