import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import Pagination from "@mui/material/Pagination";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

/* ============================================================
   API: GET /screeners/top-averages?vs_currency=usd&direction=gainers|losers&size=10&page=1&minLiquidity=0
   Response: { data: { items, total, page, size } }
============================================================ */
export interface TopAveragesItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Fitur ini memerlukan langganan aktif. Aktifkan free trial atau langganan bulanan terlebih dahulu.";

export default function ListScreenerView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest } = useHttp();

  const [direction, setDirection] = useState<"gainers" | "losers">("gainers");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [items, setItems] = useState<TopAveragesItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const fetchTopAverages = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSubscriptionRequired(false);
    try {
      const path = `/screeners/top-averages?vs_currency=usd&direction=${direction}&size=${size}&page=${page}&minLiquidity=0`;
      const result = await handleGetRequest({ path });

      if (result?.items) {
        setItems(result.items as TopAveragesItem[]);
        setTotal(result.total ?? result.items.length);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e?.status === 403) {
        setSubscriptionRequired(true);
        setErrorMessage(e?.message || SUBSCRIPTION_REQUIRED_MESSAGE);
      } else {
        setErrorMessage(e?.message || "Gagal memuat data.");
      }
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopAverages();
  }, [direction, page, size]);

  const borderColor = isDark ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0.08)";

  if (subscriptionRequired) {
    return (
      <Box sx={{ pb: 2 }}>
        <BreadCrumberStyle
          navigation={[
            {
              label: "Screeners",
              link: "/screeners",
              icon: <IconMenus.screener fontSize="small" />,
            },
          ]}
        />
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
              {errorMessage || SUBSCRIPTION_REQUIRED_MESSAGE}
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
      <BreadCrumberStyle
        navigation={[
          {
            label: "Screeners",
            link: "/screeners",
            icon: <IconMenus.screener fontSize="small" />,
          },
        ]}
      />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: isDark ? "rgba(15,23,42,0.4)" : "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                letterSpacing: "-0.02em",
                color: "text.primary",
                fontFamily: "inherit",
              }}
            >
              Top Averages
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              Gainers & losers 24h — data pasar real-time
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={fetchTopAverages}
                disabled={loading}
                size="small"
                sx={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: 1.5,
                  "&:hover": {
                    bgcolor: isDark ? "rgba(148,163,184,0.08)" : "action.hover",
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Tabs Gainers / Losers */}
        <Tabs
          value={direction}
          onChange={(_, v: "gainers" | "losers") => {
            setDirection(v);
            setPage(1);
          }}
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
        </Tabs>

        {errorMessage && !subscriptionRequired && (
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
        ) : (
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
                {items.length === 0 ? (
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
                  items.map((row, index) => {
                    const isPositive = row.priceChange24h >= 0;
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
                              {row.priceChange24h.toFixed(2)}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.marketCap)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.volume24h)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.high24h)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.low24h)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
              {total} coin • Halaman {page} dari {totalPages}
            </Typography>
            <Pagination
              color="primary"
              size="small"
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
