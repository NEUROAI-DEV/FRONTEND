/* ============================================================
   API: GET /live-predicts
   Response: { data: { items, totalItems, page, size, totalPages } }
   Each item = one symbol's prediction data (flat list)
============================================================ */

export interface ILivePredictPricePoint {
  timestamp: number;
  datetime: string;
  predicted_price: number;
  change_amount?: number;
  change_percent?: number;
}

/** One item = one symbol (BTCUSDT, ETHUSDT, ...) with its predictions */
export interface ILivePredictSymbolItem {
  symbol: string;
  interval: string;
  last_price: number;
  change_percent: number;
  predictions: ILivePredictPricePoint[];
  icon: string;
}

export interface ILivePredictListResponse {
  items: ILivePredictSymbolItem[];
  totalItems: number;
  page: number;
  size: number;
  totalPages: number;
}
