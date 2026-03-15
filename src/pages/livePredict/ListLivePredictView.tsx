import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useHttp } from "../../hooks/http";
import { convertTime } from "../../utilities/convertTime";
import { formatUSD } from "../../utilities/convertNumberToCurrency";
import type { ILivePredictSymbolItem } from "../../interfaces/LivePredict";

type CoinItem = {
  coinId: number;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
};

export default function ListLivePredictView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [items, setItems] = useState<ILivePredictSymbolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const size = 10;

  // Add coin dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [coins, setCoins] = useState<CoinItem[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [coinsError, setCoinsError] = useState<string | null>(null);
  const [coinsPage, setCoinsPage] = useState(1);
  const [coinsTotalPages, setCoinsTotalPages] = useState(1);
  const [coinsSearch, setCoinsSearch] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [savingAdd, setSavingAdd] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await handleGetRequest({
        path: `/live-predicts?page=${page - 1}&size=${size}`,
      });
      const data = result?.data ?? result;
      const list = data?.items && Array.isArray(data.items) ? data.items : [];
      setItems(list as ILivePredictSymbolItem[]);
      setTotalItems(Number(data?.totalItems) ?? 0);
      setTotalPages(Number(data?.totalPages) ?? 1);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal memuat data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCoins = async () => {
    setCoinsLoading(true);
    setCoinsError(null);
    try {
      const query = new URLSearchParams({
        page: String(coinsPage),
        size: "10",
        ...(coinsSearch.trim() ? { search: coinsSearch.trim() } : {}),
      }).toString();

      const result = await handleGetRequest({ path: `/coins?${query}` });
      const data = result?.data ?? result;
      const list = data?.items && Array.isArray(data.items) ? data.items : [];
      setCoins(list as CoinItem[]);
      setCoinsTotalPages(Number(data?.totalPages) ?? 1);
    } catch (err) {
      setCoinsError(err instanceof Error ? err.message : "Gagal memuat coin.");
    } finally {
      setCoinsLoading(false);
    }
  };

  const openAddDialog = () => {
    setSelectedSymbols(items.map((x) => x.symbol).filter(Boolean));
    setCoinsPage(1);
    setCoinsSearch("");
    setAddOpen(true);
  };

  const closeAddDialog = () => {
    if (savingAdd) return;
    setAddOpen(false);
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  const submitAdd = async () => {
    const livePredictSymbols = selectedSymbols
      .map((s) => s.trim())
      .filter(Boolean)
      .join(",");

    if (!livePredictSymbols) return;

    setSavingAdd(true);
    try {
      await handlePostRequest({
        path: "/live-predicts",
        body: { livePredictSymbols },
      });
      setAddOpen(false);
      await fetchList();
    } finally {
      setSavingAdd(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page]);

  useEffect(() => {
    if (!addOpen) return;
    fetchCoins();
  }, [addOpen, coinsPage]);

  if (loading && items.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Memuat prediksi...</Typography>
      </Stack>
    );
  }

  if (errorMessage && items.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{ width: "100%", maxWidth: "100%", paddingBottom: 10, px: 2 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight={800} sx={{ mr: 1 }}>
          Live Predict
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {items.length !== 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Add Coin
          </Button>
        )}
      </Stack>

      {items.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            border: `1px dashed ${isDark ? "rgba(148,163,184,0.35)" : "rgba(0,0,0,0.12)"}`,
            borderRadius: 3,
          }}
        >
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ maxWidth: 420, mx: "auto" }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: isDark ? "rgba(59,130,246,0.2)" : "primary.light",
                color: "primary.main",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={800}>
              Belum Ada Prediksi
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              Lihat pergerakan harga yang diprediksi untuk coin pilihan Anda.
              Pilih coin, lalu kami akan menampilkan chart prediksi berdasarkan
              analisis terkini.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1.5 }}
            >
              Pilih Coin & Buat Prediksi
            </Button>
          </Stack>
        </Card>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            width: "100%",
          }}
        >
          {items.map((item) => (
            <Box
              key={item.symbol}
              sx={{
                width: { xs: "100%", md: "calc(50% - 8px)" },
                minWidth: 0,
              }}
            >
              <SymbolCard item={item} isDark={isDark} />
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={addOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Pilih Coin
          <IconButton
            onClick={closeAddDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              placeholder="Cari coin (nama / symbol)..."
              value={coinsSearch}
              onChange={(e) => setCoinsSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCoinsPage(1);
                  fetchCoins();
                }
              }}
            />
            <Divider />

            {coinsError && <Alert severity="error">{coinsError}</Alert>}

            <Box sx={{ minHeight: 360 }}>
              {coinsLoading ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  py={6}
                  spacing={1.5}
                >
                  <CircularProgress size={22} />
                  <Typography variant="body2" color="text.secondary">
                    Memuat daftar coin...
                  </Typography>
                </Stack>
              ) : (
                <List dense disablePadding>
                  {coins.map((c) => {
                    const checked = selectedSymbols.includes(c.coinSymbol);
                    return (
                      <ListItem
                        key={c.coinId}
                        disablePadding
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={checked}
                            onChange={() => toggleSymbol(c.coinSymbol)}
                          />
                        }
                      >
                        <ListItemButton
                          onClick={() => toggleSymbol(c.coinSymbol)}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={c.coinImage}
                              alt={c.coinName}
                              sizes="small"
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography fontWeight={700}>
                                  {c.coinName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {c.coinSymbol}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>

            {coinsTotalPages > 1 && (
              <Stack alignItems="center" pt={1}>
                <Pagination
                  count={coinsTotalPages}
                  page={coinsPage}
                  onChange={(_, p) => setCoinsPage(p)}
                  size="small"
                />
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              Dipilih: {selectedSymbols.length} coin
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={closeAddDialog}
            disabled={savingAdd}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={submitAdd}
            disabled={savingAdd || selectedSymbols.length === 0}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {savingAdd ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {totalPages > 1 && (
        <Stack alignItems="center" spacing={1} sx={{ pt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" color="text.secondary">
            Total {totalItems} prediksi
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function SymbolCard({
  item,
  isDark,
}: {
  item: ILivePredictSymbolItem;
  isDark: boolean;
}) {
  const points = item.predictions ?? [];
  const categories = points.map((p) =>
    p.datetime
      ? convertTime(p.datetime)
      : new Date(p.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
  );
  const seriesData = points.map((p) => Number(p.predicted_price));
  const colorIndex = Math.abs(item.symbol.length) % CHART_COLORS.length;
  const strokeColor = CHART_COLORS[colorIndex];
  const isPositive = Number(item.change_percent) >= 0;

  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 280,
      toolbar: { show: true },
      zoom: { enabled: true },
      background: "transparent",
      fontFamily: "inherit",
      foreColor: isDark ? "#94A3B8" : "#64748B",
    },
    colors: [strokeColor],
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    grid: {
      borderColor: isDark ? "rgba(148,163,184,0.12)" : "rgba(0,0,0,0.06)",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "11px" },
        rotate: -45,
        rotateAlways: categories.length > 6,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatUSD(val),
        style: { fontSize: "11px" },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => formatUSD(val),
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    markers: {
      size: 4,
      hover: { size: 6 },
    },
  };

  const series = [
    {
      name: item.symbol,
      data: seriesData,
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: isDark ? "rgba(15,23,42,0.4)" : "background.paper",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1.5}
            sx={{ mb: 0.5 }}
          >
            <Avatar
              src={item.icon}
              alt={item.symbol}
              sx={{ width: 32, height: 32 }}
            />
            <Typography fontWeight={700} variant="subtitle1">
              {item.symbol}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Interval: {item.interval}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" fontWeight={600}>
                {formatUSD(Number(item.last_price))}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.25}
                sx={{
                  color: isPositive ? "success.main" : "error.main",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16 }} />
                )}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: isPositive ? "success.main" : "error.main",
                    fontWeight: 600,
                  }}
                >
                  {isPositive ? "+" : ""}
                  {Number(item.change_percent).toFixed(2)}%
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {points.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Rentang: {formatUSD(Math.min(...seriesData))} –{" "}
              {formatUSD(Math.max(...seriesData))}
            </Typography>
          )}

          <Box sx={{ minHeight: 280 }}>
            <Chart
              options={chartOptions}
              series={series}
              type="line"
              height={280}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
