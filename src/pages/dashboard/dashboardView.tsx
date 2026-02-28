import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Box,
  Stack,
  Typography,
  IconButton,
  useTheme,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useHttp } from "../../hooks/http";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { GeckoCoinItem } from "../../interfaces/Market";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

/* ================= API: baseUrl/markets/daily-summary ================= */
interface DailySummaryData {
  dailySummaryId?: number;
  dailySummaryDate?: string;
  dailySummaryMarketSentiment?: string;
  dailySummaryConfidence?: string;
  dailySummarySummary?: string;
  dailySummaryHighlights?: string[];
}

function getSentimentColor(
  sentiment: string,
): "default" | "primary" | "success" | "warning" | "error" {
  const v = String(sentiment ?? "").toUpperCase();
  if (v === "NEGATIVE") return "error";
  if (v === "POSITIVE") return "primary";
  if (v === "NEUTRAL") return "success";
  return "default";
}

const DashboardView = () => {
  const theme = useTheme();
  const { handleGetRequest } = useHttp();

  const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(
    null,
  );
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(
    null,
  );

  const [topCoins, setTopCoins] = useState<GeckoCoinItem[]>([]);

  const fetchTopCoins = async () => {
    try {
      const path = `/markets/coins/gecko?vs_currency=usd&order=market_cap_desc&size=5&page=1`;
      const result = await handleGetRequest({ path });
      if (result?.items) {
        // API mengembalikan hingga 10 data; simpan semua untuk tampilan horizontal.
        setTopCoins(result.items as GeckoCoinItem[]);
      } else {
        setTopCoins([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTopCoins();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);
      try {
        const result = await handleGetRequest({
          path: "/markets/daily-summary",
        });
        if (!cancelled && result) {
          setDailySummary({
            dailySummaryId: result.dailySummaryId,
            dailySummaryDate: result.dailySummaryDate,
            dailySummaryMarketSentiment: result.dailySummaryMarketSentiment,
            dailySummaryConfidence: result.dailySummaryConfidence,
            dailySummarySummary: result.dailySummarySummary,
            dailySummaryHighlights: result.dailySummaryHighlights ?? [],
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDailySummaryError("Failed to load daily summary.");
        }
      } finally {
        if (!cancelled) setDailySummaryLoading(false);
      }
    };
    fetchDailySummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Dashboard",
            link: "/",
            icon: <IconMenus.dashboard fontSize="small" />,
          },
        ]}
      />

      {/* ================= TOP COINS (HORIZONTAL SCROLL) ================= */}
      <Box
        sx={{
          mb: 3,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-track": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(15,23,42,0.5)"
                : "rgba(0,0,0,0.06)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(148,163,184,0.5)"
                : "rgba(148,163,184,0.7)",
            borderRadius: 999,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: "max-content",
            width: "max-content",
          }}
        >
          {topCoins.length > 0 &&
            topCoins.map((item, i) => {
              const change = item.price_change_percentage_24h ?? 0;
              const isUp = change > 0;
              const isDown = change < 0;

              const changeColor = isUp
                ? "#00E396"
                : isDown
                  ? "#F97373"
                  : "#9CA3AF";

              return (
                <Card
                  key={item.id ?? i}
                  sx={{
                    width: 260,
                    minWidth: 260,
                    flexShrink: 0,
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(148,163,184,0.28)"
                        : "rgba(15,23,42,0.08)"
                    }`,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#020617" : "#FFFFFF",
                    boxShadow: "none",
                    display: "flex",
                    flexDirection: "column",
                    // gap: 1.5,
                  }}
                >
                  {/* Header row: icon + name + 24h change */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          bgcolor: "background.paper",
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              theme.palette.mode === "dark"
                                ? "#E5E7EB"
                                : "#0F172A",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: "uppercase" }}
                        >
                          {item.symbol}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={0.25} alignItems="flex-end">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 11 }}
                      >
                        24h
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {isUp && (
                          <TrendingUpIcon
                            sx={{ fontSize: 16, color: changeColor }}
                          />
                        )}
                        {isDown && (
                          <TrendingDownIcon
                            sx={{ fontSize: 16, color: changeColor }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: changeColor }}
                        >
                          {change.toFixed(2)}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Price */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: 11 }}
                    >
                      Price
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatUSD(item.current_price)}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/markets"
          variant="outlined"
          size="small"
          sx={{ textTransform: "none" }}
        >
          View all
        </Button>
      </Stack>

      {/* ================= DAILY MARKET SUMMARY (API) ================= */}
      <Grid container spacing={3} mb={3} maxWidth="100%" mx="auto">
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
            mb={2}
          >
            <Typography fontWeight="bold" variant="h6">
              Daily Market Summary
            </Typography>
            {dailySummaryLoading && <CircularProgress size={24} />}
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {dailySummaryError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dailySummaryError}
            </Alert>
          )}
          {!dailySummaryLoading && dailySummary && (
            <Stack spacing={2}>
              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                gap={1}
              >
                {dailySummary.dailySummaryDate && (
                  <Typography variant="body2" color="text.secondary">
                    {dailySummary.dailySummaryDate}
                  </Typography>
                )}
                {dailySummary.dailySummaryMarketSentiment && (
                  <Chip
                    size="small"
                    label={dailySummary.dailySummaryMarketSentiment}
                    color={getSentimentColor(
                      dailySummary.dailySummaryMarketSentiment,
                    )}
                    variant="outlined"
                  />
                )}
                {dailySummary.dailySummaryConfidence != null &&
                  dailySummary.dailySummaryConfidence !== "" && (
                    <Typography variant="body2" color="text.secondary">
                      Confidence:{" "}
                      {Number(dailySummary.dailySummaryConfidence) * 100}%
                    </Typography>
                  )}
              </Stack>
              {dailySummary.dailySummarySummary && (
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {dailySummary.dailySummarySummary}
                </Typography>
              )}
              {dailySummary.dailySummaryHighlights &&
                dailySummary.dailySummaryHighlights.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Highlights
                    </Typography>
                    <List dense disablePadding>
                      {dailySummary.dailySummaryHighlights.map((item, i) => (
                        <ListItem
                          key={i}
                          disablePadding
                          sx={{ alignItems: "flex-start", py: 0.25 }}
                        >
                          <ListItemIcon sx={{ minWidth: 24, mt: 0.25 }}>
                            <FiberManualRecordIcon
                              sx={{ fontSize: 8 }}
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
            </Stack>
          )}
          {!dailySummaryLoading && !dailySummary && !dailySummaryError && (
            <Typography variant="body2" color="text.secondary">
              No daily summary available.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardView;
