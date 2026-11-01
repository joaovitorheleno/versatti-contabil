import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { getToken } from "../../config/token/getToken";
import type {
  Account,
  AccountType,
  BalanceSheet,
  BankTransactionStatus,
  ClosingType,
  ClosingsResponse,
  CreateEntryPayload,
  EntriesResponse,
  ImportResult,
  IncomeStatement,
  ReconcileResult,
  ReconciliationRule,
  RuleDirection,
  TransactionsResponse,
  TrialBalance,
} from "./types";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const url = (clientId: string, path: string) =>
  `${BASE_URL}/accounting/${clientId}/${path}`;

const cleanParams = (params: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v));

export const listAccounts = async (clientId: string): Promise<Account[]> =>
  (await axios.get(url(clientId, "accounts"), authHeaders())).data;

export const createDefaultChart = async (clientId: string): Promise<Account[]> =>
  (await axios.post(url(clientId, "accounts/default"), {}, authHeaders())).data;

export const createAccount = async (
  clientId: string,
  payload: { code: string; name: string; type?: AccountType },
) => (await axios.post(url(clientId, "accounts"), payload, authHeaders())).data;

export const updateAccount = async (
  clientId: string,
  id: string,
  payload: { name?: string; active?: boolean },
) => (await axios.patch(url(clientId, `accounts/${id}`), payload, authHeaders())).data;

export const deleteAccount = async (clientId: string, id: string) =>
  (await axios.delete(url(clientId, `accounts/${id}`), authHeaders())).data;

export const listEntries = async (
  clientId: string,
  params: { from?: string; to?: string; accountId?: string },
): Promise<EntriesResponse> =>
  (
    await axios.get(url(clientId, "entries"), {
      ...authHeaders(),
      params: cleanParams(params),
    })
  ).data;

export const createEntry = async (clientId: string, payload: CreateEntryPayload) =>
  (await axios.post(url(clientId, "entries"), payload, authHeaders())).data;

export const deleteEntry = async (clientId: string, id: string) =>
  (await axios.delete(url(clientId, `entries/${id}`), authHeaders())).data;

export const importStatement = async (
  clientId: string,
  bankAccountId: string,
  file: File,
): Promise<ImportResult> => {
  const form = new FormData();
  form.append("bankAccountId", bankAccountId);
  form.append("file", file);
  return (await axios.post(url(clientId, "bank-imports"), form, authHeaders())).data;
};

export const listTransactions = async (
  clientId: string,
  params: { status?: BankTransactionStatus; from?: string; to?: string; bankAccountId?: string },
): Promise<TransactionsResponse> =>
  (
    await axios.get(url(clientId, "bank-transactions"), {
      ...authHeaders(),
      params: cleanParams(params),
    })
  ).data;

export const reconcileTransactions = async (
  clientId: string,
  items: { transactionId: string; accountId: string }[],
): Promise<ReconcileResult> =>
  (await axios.post(url(clientId, "bank-transactions/reconcile"), { items }, authHeaders())).data;

export const autoReconcile = async (clientId: string): Promise<ReconcileResult> =>
  (await axios.post(url(clientId, "bank-transactions/auto-reconcile"), {}, authHeaders())).data;

export const updateTransactionStatus = async (
  clientId: string,
  id: string,
  status: "PENDING" | "IGNORED",
) =>
  (await axios.patch(url(clientId, `bank-transactions/${id}`), { status }, authHeaders())).data;

export const listRules = async (clientId: string): Promise<ReconciliationRule[]> =>
  (await axios.get(url(clientId, "rules"), authHeaders())).data;

export const createRule = async (
  clientId: string,
  payload: { keyword: string; direction: RuleDirection; accountId: string },
) => (await axios.post(url(clientId, "rules"), payload, authHeaders())).data;

export const deleteRule = async (clientId: string, id: string) =>
  (await axios.delete(url(clientId, `rules/${id}`), authHeaders())).data;

export const getTrialBalance = async (
  clientId: string,
  params: { from?: string; to?: string },
): Promise<TrialBalance> =>
  (
    await axios.get(url(clientId, "reports/trial-balance"), {
      ...authHeaders(),
      params: cleanParams(params),
    })
  ).data;

export const getIncomeStatement = async (
  clientId: string,
  params: { from?: string; to?: string },
): Promise<IncomeStatement> =>
  (
    await axios.get(url(clientId, "reports/income-statement"), {
      ...authHeaders(),
      params: cleanParams(params),
    })
  ).data;

export const getBalanceSheet = async (
  clientId: string,
  params: { date?: string },
): Promise<BalanceSheet> =>
  (
    await axios.get(url(clientId, "reports/balance-sheet"), {
      ...authHeaders(),
      params: cleanParams(params),
    })
  ).data;

export const listClosings = async (clientId: string): Promise<ClosingsResponse> =>
  (await axios.get(url(clientId, "closings"), authHeaders())).data;

export const createClosing = async (
  clientId: string,
  payload: { type: ClosingType; reference: string },
): Promise<ClosingsResponse> =>
  (await axios.post(url(clientId, "closings"), payload, authHeaders())).data;

export const reopenLatestClosing = async (clientId: string): Promise<ClosingsResponse> =>
  (await axios.delete(url(clientId, "closings/latest"), authHeaders())).data;
