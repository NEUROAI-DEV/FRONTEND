import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useHttp } from "../../hooks/http";
import { convertTime } from "../../utilities/convertTime";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

type LivePredictResultPoint = {
  timestamp: number;
  datetime: string;
  predicted_price: number;
  change_amount?: number;
  change_percent?: number;
};

type LivePredictItem = {
  livePredictId: number;
  livePredictSymbol: string;
  livePredictIcon: string;
  livePredictInterval: string;
  livePredictLastPrice: string;
  livePredictResults: LivePredictResultPoint[];
};

export default function ListLivePredictView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest } = useHttp();

  const [items, setItems] = useState<LivePredictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0, // API uses 0-based pages: currentPage: 0, 1, ...
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await handleGetRequest({
        path: `/live-predicts?page=${paginationModel.page}&size=${paginationModel.pageSize}`,
      });
      const data = result?.data ?? result;
      const list = data?.items && Array.isArray(data.items) ? data.items : [];
      setItems(list as LivePredictItem[]);
      setTotalItems(Number(data?.totalItems) ?? 0);
      setTotalPages(Number(data?.totalPages) ?? 1);
      if (Number.isFinite(Number(data?.currentPage))) {
        setPaginationModel((prev) => ({
          ...prev,
          page: Number(data.currentPage),
        }));
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal memuat data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    const intervalId = setInterval(() => {
      fetchList();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchList]);

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
              Data akan tampil di sini setelah prediksi tersedia dari sistem.
            </Typography>
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
              key={item.livePredictSymbol}
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

      {totalPages > 1 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {items.length} of {totalItems} items
          </Typography>

          <Pagination
            color="primary"
            shape="rounded"
            page={paginationModel.page + 1}
            count={Math.max(1, totalPages)}
            onChange={(_, page) =>
              setPaginationModel((prev) => ({ ...prev, page: page - 1 }))
            }
          />
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
  item: LivePredictItem;
  isDark: boolean;
}) {
  const points = item.livePredictResults ?? [];

  const { categories, seriesData } = useMemo(() => {
    const cats = points.map((p) =>
      p.datetime
        ? convertTime(p.datetime)
        : new Date(p.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
    );
    const data = points.map((p) => Number(p.predicted_price));
    return { categories: cats, seriesData: data };
  }, [points]);

  const colorIndex =
    Math.abs(item.livePredictSymbol.length) % CHART_COLORS.length;
  const strokeColor = CHART_COLORS[colorIndex];
  const lastPoint = points.length ? points[points.length - 1] : null;
  const changePercent = Number(lastPoint?.change_percent ?? 0);
  const isPositive = changePercent >= 0;

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
      name: item.livePredictSymbol,
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
              src={item.livePredictIcon}
              alt={item.livePredictSymbol}
              sx={{ width: 32, height: 32 }}
            />
            <Typography fontWeight={700} variant="subtitle1">
              {item.livePredictSymbol}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Interval: {item.livePredictInterval}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" fontWeight={600}>
                {formatUSD(Number(item.livePredictLastPrice))}
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
                  {changePercent.toFixed(2)}%
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
