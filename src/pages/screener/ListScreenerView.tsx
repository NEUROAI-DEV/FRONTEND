import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Pagination from "@mui/material/Pagination";
import { useHttp } from "../../hooks/http";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

/* ============================================================
   Trending: GET /screeners?category=trending&...
   Response: items[] with item: { name, symbol, market_cap_rank, thumb, data: { price, price_change_percentage_24h: { usd }, market_cap, total_volume } }
============================================================ */
interface TrendingRawItem {
  item: {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    data?: {
      price: number;
      price_change_percentage_24h?: { usd?: number };
      market_cap?: string;
      total_volume?: string;
    };
  };
}

interface TrendingRow {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  thumb: string;
  price: number;
  priceChange24hUsd: number;
  marketCap: string;
  totalVolume: string;
}

/* ============================================================
   Gainers/Losers: GET /screeners?category=gainer|loser&...
   Response: items[] flat { id, symbol, name, image, current_price, market_cap_rank, total_volume, high_24h, low_24h, price_change_percentage_24h }
============================================================ */
interface MarketTrendItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number | null;
}

const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Fitur ini memerlukan langganan aktif. Aktifkan free trial atau langganan bulanan terlebih dahulu.";

type TabValue = "trending" | "gainers" | "losers" | "market";

const SIZE = 10;

export default function ListScreenerView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest } = useHttp();

  const [tab, setTab] = useState<TabValue>("trending");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  // Trending state
  const [trendingItems, setTrendingItems] = useState<TrendingRow[]>([]);
  const [trendingPage, setTrendingPage] = useState(1);
  const [trendingTotalItems, setTrendingTotalItems] = useState(0);
  const [trendingTotalPages, setTrendingTotalPages] = useState(1);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);

  // Gainers/Losers state (shared for both tabs)
  const [marketItems, setMarketItems] = useState<MarketTrendItem[]>([]);
  const [marketPage, setMarketPage] = useState(1);
  const [marketTotalItems, setMarketTotalItems] = useState(0);
  const [marketTotalPages, setMarketTotalPages] = useState(1);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [errorMarket, setErrorMarket] = useState<string | null>(null);

  // Market tab state (category=markets)
  const [marketsItems, setMarketsItems] = useState<MarketTrendItem[]>([]);
  const [marketsPage, setMarketsPage] = useState(1);
  const [marketsTotalItems, setMarketsTotalItems] = useState(0);
  const [marketsTotalPages, setMarketsTotalPages] = useState(1);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [errorMarkets, setErrorMarkets] = useState<string | null>(null);

  const borderColor = isDark ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0.08)";

  const mapTrendingRow = (raw: TrendingRawItem): TrendingRow => {
    const it = raw.item;
    const d = it.data;
    const change24h = d?.price_change_percentage_24h?.usd ?? 0;
    return {
      id: it.id,
      name: it.name ?? "",
      symbol: it.symbol ?? "",
      marketCapRank: it.market_cap_rank ?? 0,
      thumb: it.thumb ?? "",
      price: typeof d?.price === "number" ? d.price : 0,
      priceChange24hUsd: typeof change24h === "number" ? change24h : 0,
      marketCap: d?.market_cap ?? "—",
      totalVolume: d?.total_volume ?? "—",
    };
  };

  const fetchTrending = async () => {
    setErrorTrending(null);
    setSubscriptionRequired(false);
    try {
      const path = `/screeners?category=trending&page=${trendingPage}&size=${SIZE}&vs_currency=usd&order=market_cap_desc`;
      const result = await handleGetRequest({ path });
      if (result?.items && Array.isArray(result.items)) {
        setTrendingItems(
          (result.items as TrendingRawItem[]).map(mapTrendingRow),
        );
        setTrendingTotalItems(result.totalItems ?? result.items.length);
        setTrendingTotalPages(
          Math.max(
            1,
            result.totalPages ??
              Math.ceil((result.totalItems ?? result.items.length) / SIZE),
          ),
        );
      } else {
        setTrendingItems([]);
        setTrendingTotalItems(0);
        setTrendingTotalPages(1);
      }
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e?.status === 403) {
        setSubscriptionRequired(true);
        setErrorTrending(e?.message || SUBSCRIPTION_REQUIRED_MESSAGE);
      } else {
        setErrorTrending(e?.message || "Gagal memuat data trending.");
      }
      setTrendingItems([]);
      setTrendingTotalItems(0);
      setTrendingTotalPages(1);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchMarketTrend = async (category: "gainers" | "losers") => {
    setErrorMarket(null);
    setSubscriptionRequired(false);
    try {
      const path = `/screeners?category=${category}&page=${marketPage}&size=${SIZE}&vs_currency=usd&order=market_cap_desc`;
      const result = await handleGetRequest({ path });
      if (result?.items && Array.isArray(result.items)) {
        setMarketItems(result.items as MarketTrendItem[]);
        setMarketTotalItems(result.totalItems ?? result.items.length);
        setMarketTotalPages(
          Math.max(
            1,
            result.totalPages ??
              Math.ceil((result.totalItems ?? result.items.length) / SIZE),
          ),
        );
      } else {
        setMarketItems([]);
        setMarketTotalItems(0);
        setMarketTotalPages(1);
      }
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e?.status === 403) {
        setSubscriptionRequired(true);
        setErrorMarket(e?.message || SUBSCRIPTION_REQUIRED_MESSAGE);
      } else {
        setErrorMarket(e?.message || "Gagal memuat data.");
      }
      setMarketItems([]);
      setMarketTotalItems(0);
      setMarketTotalPages(1);
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    if (tab === "trending") fetchTrending();
  }, [tab, trendingPage]);

  const fetchMarketsTab = async () => {
    setErrorMarkets(null);
    setSubscriptionRequired(false);
    try {
      const path = `/screeners?category=markets&page=${marketsPage}&size=${SIZE}&vs_currency=usd&order=market_cap_desc`;
      const result = await handleGetRequest({ path });
      if (result?.items && Array.isArray(result.items)) {
        setMarketsItems(result.items as MarketTrendItem[]);
        setMarketsTotalItems(result.totalItems ?? result.items.length);
        setMarketsTotalPages(
          Math.max(
            1,
            result.totalPages ??
              Math.ceil((result.totalItems ?? result.items.length) / SIZE),
          ),
        );
      } else {
        setMarketsItems([]);
        setMarketsTotalItems(0);
        setMarketsTotalPages(1);
      }
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e?.status === 403) {
        setSubscriptionRequired(true);
        setErrorMarkets(e?.message || SUBSCRIPTION_REQUIRED_MESSAGE);
      } else {
        setErrorMarkets(e?.message || "Gagal memuat data market.");
      }
      setMarketsItems([]);
      setMarketsTotalItems(0);
      setMarketsTotalPages(1);
    } finally {
      setLoadingMarkets(false);
    }
  };

  useEffect(() => {
    if (tab === "gainers") fetchMarketTrend("gainers");
    if (tab === "losers") fetchMarketTrend("losers");
  }, [tab, marketPage]);

  useEffect(() => {
    if (tab === "market") fetchMarketsTab();
  }, [tab, marketsPage]);

  // Auto-refresh data every 30 seconds for realtime updates
  const REFRESH_INTERVAL_MS = 10 * 1000;
  useEffect(() => {
    if (subscriptionRequired) return;
    const interval = setInterval(() => {
      if (tab === "trending") fetchTrending();
      else if (tab === "gainers") fetchMarketTrend("gainers");
      else if (tab === "losers") fetchMarketTrend("losers");
      else if (tab === "market") fetchMarketsTab();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [tab, subscriptionRequired, trendingPage, marketPage, marketsPage]);

  const handleTabChange = (_: React.SyntheticEvent, newTab: TabValue) => {
    setTab(newTab);
    if (newTab === "trending") setTrendingPage(1);
    else if (newTab === "market") setMarketsPage(1);
    else setMarketPage(1);
  };

  const loading =
    tab === "trending"
      ? loadingTrending
      : tab === "market"
        ? loadingMarkets
        : loadingMarket;
  const errorMessage =
    tab === "trending"
      ? errorTrending
      : tab === "market"
        ? errorMarkets
        : errorMarket;
  const setErrorMessage =
    tab === "trending"
      ? setErrorTrending
      : tab === "market"
        ? setErrorMarkets
        : setErrorMarket;

  if (subscriptionRequired) {
    return (
      <Box sx={{ pb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${borderColor}`,
            bgcolor: isDark ? "rgba(15,23,42,0.5)" : "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Alert severity="warning">
              {errorTrending ||
                errorMarket ||
                errorMarkets ||
                SUBSCRIPTION_REQUIRED_MESSAGE}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Untuk mengakses fitur Screeners, aktifkan free trial 30 hari atau
              langganan bulanan di halaman Langganan.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={() => navigate("/subscription")}
              >
                Aktifkan free trial / Langganan
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/my-profile")}
              >
                Ke Profile
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2, width: "100%", minWidth: 0 }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: isDark ? "rgba(15,23,42,0.4)" : "background.paper",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            px: 2,
            minHeight: 48,
            borderBottom: `1px solid ${borderColor}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
            },
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
          }}
        >
          <Tab value="trending" label="Trending" />
          <Tab
            value="gainers"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 18 }} color="success" />
                <span>Gainers</span>
              </Stack>
            }
          />
          <Tab
            value="losers"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingDownIcon sx={{ fontSize: 18 }} color="error" />
                <span>Losers</span>
              </Stack>
            }
          />
          <Tab value="market" label="Market" />
        </Tabs>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mx: 2, mt: 2 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : tab === "trending" ? (
          <>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-head": {
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "text.secondary",
                        borderBottomColor: borderColor,
                        py: 1.5,
                        bgcolor: isDark ? "rgba(15,23,42,0.6)" : "action.hover",
                      },
                    }}
                  >
                    <TableCell align="center">#</TableCell>
                    <TableCell>Coin</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">24h % (USD)</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell align="right">Total Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendingItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 6, color: "text.secondary", borderColor }}
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trendingItems.map((row) => {
                      const isPositive = row.priceChange24hUsd >= 0;
                      const changeColor = isPositive ? "#22c55e" : "#ef4444";
                      return (
                        <TableRow
                          key={`${row.id}-${row.symbol}`}
                          hover
                          sx={{
                            "& .MuiTableCell-root": {
                              borderBottomColor: borderColor,
                              py: 1.5,
                              fontVariantNumeric: "tabular-nums",
                            },
                            "&:hover": {
                              bgcolor: isDark
                                ? "rgba(148,163,184,0.06)"
                                : "action.hover",
                            },
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            <Chip
                              label={row.marketCapRank}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: isDark
                                  ? "rgba(148,163,184,0.12)"
                                  : "action.selected",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Box
                                component="img"
                                src={row.thumb}
                                alt={row.symbol}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: `1px solid ${borderColor}`,
                                }}
                              />
                              <Stack>
                                <Typography
                                  fontWeight={700}
                                  sx={{ fontSize: 14, lineHeight: 1.2 }}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {String(row.symbol).toUpperCase()}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                              {formatUSD(row.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              {isPositive ? (
                                <TrendingUpIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              ) : (
                                <TrendingDownIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{ color: changeColor, fontSize: 13 }}
                              >
                                {isPositive ? "+" : ""}
                                {row.priceChange24hUsd.toFixed(2)}%
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {row.marketCap}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {row.totalVolume}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {trendingTotalPages > 1 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  px: 2,
                  py: 2,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {trendingTotalItems} coin • Halaman {trendingPage} dari{" "}
                  {trendingTotalPages}
                </Typography>
                <Pagination
                  color="primary"
                  size="small"
                  count={trendingTotalPages}
                  page={trendingPage}
                  onChange={(_, value) => setTrendingPage(value)}
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        ) : tab === "market" ? (
          <>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-head": {
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "text.secondary",
                        borderBottomColor: borderColor,
                        py: 1.5,
                        bgcolor: isDark ? "rgba(15,23,42,0.6)" : "action.hover",
                      },
                    }}
                  >
                    <TableCell align="center">#</TableCell>
                    <TableCell>Coin</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">24h %</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell align="right">Vol (24h)</TableCell>
                    <TableCell align="right">High 24h</TableCell>
                    <TableCell align="right">Low 24h</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketsItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ py: 6, color: "text.secondary", borderColor }}
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    marketsItems.map((row) => {
                      const change24h = row.price_change_percentage_24h ?? 0;
                      const isPositive = change24h >= 0;
                      const changeColor = isPositive ? "#22c55e" : "#ef4444";
                      return (
                        <TableRow
                          key={`${row.id}-${row.symbol}`}
                          hover
                          sx={{
                            "& .MuiTableCell-root": {
                              borderBottomColor: borderColor,
                              py: 1.5,
                              fontVariantNumeric: "tabular-nums",
                            },
                            "&:hover": {
                              bgcolor: isDark
                                ? "rgba(148,163,184,0.06)"
                                : "action.hover",
                            },
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            <Chip
                              label={row.market_cap_rank}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: isDark
                                  ? "rgba(148,163,184,0.12)"
                                  : "action.selected",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Box
                                component="img"
                                src={row.image}
                                alt={row.symbol}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: `1px solid ${borderColor}`,
                                }}
                              />
                              <Stack>
                                <Typography
                                  fontWeight={700}
                                  sx={{ fontSize: 14, lineHeight: 1.2 }}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {String(row.symbol).toUpperCase()}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                              {formatUSD(row.current_price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              {isPositive ? (
                                <TrendingUpIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              ) : (
                                <TrendingDownIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{ color: changeColor, fontSize: 13 }}
                              >
                                {isPositive ? "+" : ""}
                                {change24h.toFixed(2)}%
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.market_cap)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.total_volume)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.high_24h)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.low_24h)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {marketsTotalPages > 1 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  px: 2,
                  py: 2,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {marketsTotalItems} coin • Halaman {marketsPage} dari{" "}
                  {marketsTotalPages}
                </Typography>
                <Pagination
                  color="primary"
                  size="small"
                  count={marketsTotalPages}
                  page={marketsPage}
                  onChange={(_, value) => setMarketsPage(value)}
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        ) : (
          <>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-head": {
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "text.secondary",
                        borderBottomColor: borderColor,
                        py: 1.5,
                        bgcolor: isDark ? "rgba(15,23,42,0.6)" : "action.hover",
                      },
                    }}
                  >
                    <TableCell align="center">#</TableCell>
                    <TableCell>Coin</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">24h %</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell align="right">Vol (24h)</TableCell>
                    <TableCell align="right">High 24h</TableCell>
                    <TableCell align="right">Low 24h</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ py: 6, color: "text.secondary", borderColor }}
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    marketItems.map((row) => {
                      const change24h = row.price_change_percentage_24h ?? 0;
                      const isPositive = change24h >= 0;
                      const changeColor = isPositive ? "#22c55e" : "#ef4444";
                      return (
                        <TableRow
                          key={`${row.id}-${row.symbol}`}
                          hover
                          sx={{
                            "& .MuiTableCell-root": {
                              borderBottomColor: borderColor,
                              py: 1.5,
                              fontVariantNumeric: "tabular-nums",
                            },
                            "&:hover": {
                              bgcolor: isDark
                                ? "rgba(148,163,184,0.06)"
                                : "action.hover",
                            },
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            <Chip
                              label={row.market_cap_rank}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: isDark
                                  ? "rgba(148,163,184,0.12)"
                                  : "action.selected",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Box
                                component="img"
                                src={row.image}
                                alt={row.symbol}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: `1px solid ${borderColor}`,
                                }}
                              />
                              <Stack>
                                <Typography
                                  fontWeight={700}
                                  sx={{ fontSize: 14, lineHeight: 1.2 }}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {String(row.symbol).toUpperCase()}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                              {formatUSD(row.current_price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              {isPositive ? (
                                <TrendingUpIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              ) : (
                                <TrendingDownIcon
                                  sx={{ fontSize: 16, color: changeColor }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{ color: changeColor, fontSize: 13 }}
                              >
                                {isPositive ? "+" : ""}
                                {change24h.toFixed(2)}%
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.market_cap)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.total_volume)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.high_24h)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.low_24h)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {marketTotalPages > 1 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  px: 2,
                  py: 2,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {marketTotalItems} coin • Halaman {marketPage} dari{" "}
                  {marketTotalPages}
                </Typography>
                <Pagination
                  color="primary"
                  size="small"
                  count={marketTotalPages}
                  page={marketPage}
                  onChange={(_, value) => setMarketPage(value)}
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
