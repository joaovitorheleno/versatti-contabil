export enum AccountTypeEnum {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum JournalSourceEnum {
  MANUAL = 'MANUAL',
  BANK = 'BANK',
}

export enum BankTransactionStatusEnum {
  PENDING = 'PENDING',
  RECONCILED = 'RECONCILED',
  IGNORED = 'IGNORED',
}

export enum RuleDirectionEnum {
  ANY = 'ANY',
  IN = 'IN',
  OUT = 'OUT',
}

export enum ClosingTypeEnum {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export const DEBIT_NATURE_TYPES = [AccountTypeEnum.ASSET, AccountTypeEnum.EXPENSE];
