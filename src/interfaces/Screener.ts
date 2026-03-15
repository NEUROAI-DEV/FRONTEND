export interface ICoinPriceChangePercentage24h {
  usd: number;
  idr: number;
}

export interface ICoinData {
  price: number;
  price_btc: string;
  price_change_percentage_24h: ICoinPriceChangePercentage24h;
  market_cap: string;
  market_cap_btc: string;
  total_volume: string;
  total_volume_btc: string;
  sparkline: string;
}

export interface ITrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data: ICoinData;
  };
}
