export const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';

export type DocumentStatus = 'EXPIRED' | 'EXPIRING' | 'VALID' | 'NO_EXPIRATION';

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BRAZIL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const dateKeyOf = (date: Date): string => dateKeyFormatter.format(date);

export const monthKeyOf = (date: Date): string => dateKeyOf(date).slice(0, 7);

export const todayKey = (): string => dateKeyOf(new Date());

export const addMonthsToMonthKey = (monthKey: string, months: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const total = year * 12 + (month - 1) + months;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
};

export const addDays = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const daysBetween = (from: string, to: string): number =>
  Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() -
      new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000,
  );

export const getDocumentStatus = (
  expirationDate: string | null,
  alertDays: number | null,
  today: string,
): DocumentStatus => {
  if (!expirationDate) return 'NO_EXPIRATION';
  if (expirationDate < today) return 'EXPIRED';
  if (daysBetween(today, expirationDate) <= (alertDays ?? 0)) return 'EXPIRING';
  return 'VALID';
};
