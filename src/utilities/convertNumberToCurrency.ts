/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
export const convertNumberToCurrency = (inputNumber: any) => {
  const re = "\\d(?=(\\d{" + (0 || 3) + "})+" + (2 > 0 ? "\\." : "$") + ")";
  const parseInt = parseFloat(inputNumber ?? 0);
  return parseInt.toFixed(Math.max(0, ~~2)).replace(new RegExp(re, "g"), "$&,");
};

export const formatUSD = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
};

export const formatIDR = (value: number): string => {
  const compact = (n: number) =>
    n
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1");

  if (value >= 1e12) return `Rp${compact(value / 1e12)}T`;
  if (value >= 1e9) return `Rp${compact(value / 1e9)}B`;
  if (value >= 1e6) return `Rp${compact(value / 1e6)}M`;
  if (value >= 1e3) return `Rp${compact(value / 1e3)}k`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
