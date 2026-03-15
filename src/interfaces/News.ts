/** Coin impact object from API (field name is "neswCoinImpact" in response) */
export interface INewsCoinImpact {
  id: string;
  name: string;
  image: string;
  symbol: string;
  market_cap: number;
  current_price: number;
  market_cap_rank: number;
}

export interface INews {
  newsId: number;
  newsExternalId: string | null;
  newsSlug: string | null;
  newsTitle: string;
  newsDescription: string;
  newsPublishedAt: string;
  newsCreatedAt: string;
  newsKind: string;
  newsSentimentConfidence?: string | number;
  newsSentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  newsSentimentReason: string;
  newsSentimentCategory?: "NORMAL" | "TRENDING";
  /** Typo from API: "neswCoinImpact" */
  neswCoinImpact?: INewsCoinImpact | null;
}
