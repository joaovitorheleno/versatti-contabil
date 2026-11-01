import dayjs from "dayjs";
import type { SelectOption } from "../../components/selectButton/SelectComponent";
import { openErrorNotification } from "../../components/notification/error";
import type { Account, AccountType } from "../../service/accounting/types";

export const API_FORMAT = "YYYY-MM-DD";
export const DATE_FORMAT = "DD/MM/YYYY";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatMoney = (value: number) => currency.format(value);

export const formatDate = (date: string | null | undefined) =>
  date ? dayjs(date).format(DATE_FORMAT) : "-";

export const accountTypeLabels: Record<AccountType, string> = {
  ASSET: "Ativo",
  LIABILITY: "Passivo",
  EQUITY: "Patrimônio Líquido",
  REVENUE: "Receita",
  EXPENSE: "Custo/Despesa",
};

export const accountLabel = (account: { code: string; name: string }) =>
  `${account.code} - ${account.name}`;

export const postableOptions = (
  accounts: Account[],
  filter?: (account: Account) => boolean,
): SelectOption[] =>
  accounts
    .filter((a) => a.analytic && a.active && (!filter || filter(a)))
    .map((a) => ({ value: a.id, label: accountLabel(a) }));

type ApiErrorLike = {
  message?: string;
  response?: { data?: { message?: string | string[] } };
};

export const apiError = (error: unknown) => {
  const err = error as ApiErrorLike | undefined;
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || String(error);
};

export const notifyError = (title: string, error: unknown) =>
  openErrorNotification({ title, description: apiError(error) });
