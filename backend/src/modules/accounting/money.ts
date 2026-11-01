export const toCents = (value: string | number | null | undefined) =>
  Math.round(Number(value ?? 0) * 100);

export const fromCents = (cents: number) => (cents / 100).toFixed(2);

export const centsToNumber = (cents: number) => Math.round(cents) / 100;
