export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type BankTransactionStatus = "PENDING" | "RECONCILED" | "IGNORED";

export type RuleDirection = "ANY" | "IN" | "OUT";

export type ClosingType = "MONTH" | "QUARTER" | "YEAR";

export type AccountRef = { id: string; code: string; name: string };

export type Account = AccountRef & {
  type: AccountType;
  analytic: boolean;
  active: boolean;
  level: number;
  hasEntries: boolean;
};

export type JournalLine = {
  id: string;
  account: AccountRef;
  debit: number;
  credit: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  description: string;
  source: "MANUAL" | "BANK";
  createdAt: string;
  locked: boolean;
  total: number;
  lines: JournalLine[];
};

export type EntriesResponse = {
  lockedUntil: string | null;
  entries: JournalEntry[];
};

export type CreateEntryPayload = {
  date: string;
  description: string;
  lines: { accountId: string; debit: number; credit: number }[];
};

export type BankTransaction = {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: BankTransactionStatus;
  locked: boolean;
  bankAccount: AccountRef;
  suggestedAccount: AccountRef | null;
  journalEntryId: string | null;
  counterpart: AccountRef | null;
};

export type TransactionsResponse = {
  lockedUntil: string | null;
  transactions: BankTransaction[];
};

export type ImportResult = {
  id: string;
  format: "OFX" | "CSV";
  fileName: string;
  total: number;
  imported: number;
  duplicates: number;
  suggested: number;
  periodStart: string;
  periodEnd: string;
};

export type ReconcileResult = {
  reconciled: number;
  failed: { transactionId: string; description: string; reason: string }[];
};

export type ReconciliationRule = {
  id: string;
  keyword: string;
  direction: RuleDirection;
  account: AccountRef;
};

export type TrialBalanceRow = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  analytic: boolean;
  level: number;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
  openingSide: "" | "D" | "C";
  closingSide: "" | "D" | "C";
};

export type ClientRef = { id: string; name: string; cnpj: string };

export type TrialBalance = {
  client: ClientRef;
  from: string;
  to: string;
  rows: TrialBalanceRow[];
  totals: { debit: number; credit: number; balanced: boolean };
};

export type StatementLine = {
  code: string;
  name: string;
  level: number;
  value: number;
};

export type IncomeStatement = {
  client: ClientRef;
  from: string;
  to: string;
  result: number;
  sections: {
    key: string;
    label: string;
    lines: StatementLine[];
    total: number;
    subtotal?: boolean;
  }[];
};

export type BalanceSheet = {
  client: ClientRef;
  date: string;
  assets: { lines: StatementLine[]; total: number };
  liabilities: { lines: StatementLine[]; total: number };
  equity: { lines: StatementLine[]; total: number };
  liabilitiesAndEquity: number;
  balanced: boolean;
};

export type PeriodClosing = {
  id: string;
  type: ClosingType;
  reference: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
};

export type ClosingsResponse = {
  lockedUntil: string | null;
  closings: PeriodClosing[];
};
