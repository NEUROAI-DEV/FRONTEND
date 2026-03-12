import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Box,
  Stack,
  Typography,
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
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useHttp } from "../../hooks/http";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { formatUSD } from "../../utilities/convertNumberToCurrency";
import { ITrendingCoin } from "../../interfaces/Screener";
import { convertTime } from "../../utilities/convertTime";

/* ================= API: baseUrl/markets/daily-summary ================= */
interface DailySummaryData {
  dailySummaryId?: number;
  dailySummaryDate?: string;
  dailySummaryMarketSentiment?: string;
  dailySummaryConfidence?: string;
  dailySummarySummary?: string;
  dailySummaryHighlights?: string[];
}

interface TrendingNewsItem {
  newsId: number;
  newsTitle: string;
  newsDescription: string | null;
  newsPublishedAt: string;
  newsSentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | string;
  newsSentimentCategory?: "NORMAL" | "TRENDING" | string;
  neswCoinImpact?: {
    id: string;
    name: string;
    image: string;
    symbol: string;
  } | null;
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
  const navigate = useNavigate();

  const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(
    null,
  );
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(
    null,
  );

  const [topCoins, setTopCoins] = useState<ITrendingCoin[]>([]);
  const [trendingNews, setTrendingNews] = useState<TrendingNewsItem[]>([]);
  const [trendingNewsLoading, setTrendingNewsLoading] = useState(false);
  const [trendingNewsError, setTrendingNewsError] = useState<string | null>(
    null,
  );

  const fetchTopCoins = async () => {
    try {
      const path = `/screeners?category=trending&page=1&size=5&vs_currency=usd&order=market_cap_desc`;
      const result = await handleGetRequest({ path });

      if (result?.items) {
        setTopCoins(result.items as ITrendingCoin[]);
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

    const fetchTrendingNews = async () => {
      setTrendingNewsLoading(true);
      setTrendingNewsError(null);
      try {
        const result = await handleGetRequest({
          path: "/news?page=1&size=5&pagination=true&category=TRENDING",
        });
        const data = result?.data ?? result;
        const items: TrendingNewsItem[] = data?.items ?? [];
        if (!cancelled) {
          setTrendingNews(items);
        }
      } catch (error) {
        if (!cancelled) {
          setTrendingNewsError("Failed to load trending news.");
          setTrendingNews([]);
        }
      } finally {
        if (!cancelled) setTrendingNewsLoading(false);
      }
    };

    fetchTrendingNews();

    return () => {
      cancelled = true;
    };
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
          mb: 1,
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
        <Typography fontWeight="bold" variant="h6">
          Trending Coins
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: "max-content",
            width: "max-content",
          }}
        >
          {topCoins.length > 0 &&
            topCoins.map((coin, i) => {
              const item = coin.item;
              const change = item?.data?.price_change_percentage_24h?.usd ?? 0;
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
                        src={item?.thumb ?? ""}
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
                      {formatUSD(item.data?.price ?? 0)}
                    </Typography>
                  </Box>
                </Card>
              );
            })}
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Link to="/screeners" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            View all
          </Button>
        </Link>
      </Stack>

      {/* ================= TRENDING NEWS ================= */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          mb={2}
        >
          <Typography fontWeight="bold" variant="h6">
            Trending News
          </Typography>
          {trendingNewsLoading && <CircularProgress size={24} />}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {trendingNewsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {trendingNewsError}
          </Alert>
        )}
        {!trendingNewsLoading &&
          trendingNews.length === 0 &&
          !trendingNewsError && (
            <Typography variant="body2" color="text.secondary">
              No trending news available.
            </Typography>
          )}
        {!!trendingNews.length && (
          <Box
            sx={{
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
              {trendingNews.map((news) => {
                const sentimentColor = getSentimentColor(
                  String(news.newsSentiment ?? ""),
                );
                return (
                  <Card
                    key={news.newsId}
                    variant="outlined"
                    sx={{
                      width: 320,
                      minWidth: 320,
                      flexShrink: 0,
                      borderRadius: 3,
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderColor:
                        theme.palette.mode === "dark"
                          ? "rgba(148,163,184,0.28)"
                          : "rgba(15,23,42,0.08)",
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#020617" : "#FFFFFF",
                      "&:hover": {
                        boxShadow: 3,
                        borderColor: "primary.light",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {news.newsTitle}
                      </Typography>
                      <Stack
                        direction="column"
                        spacing={0.5}
                        alignItems="flex-end"
                        flexShrink={0}
                      >
                        {news.newsSentimentCategory === "TRENDING" && (
                          <Chip
                            size="small"
                            label="TRENDING"
                            color="warning"
                            variant="filled"
                            sx={{
                              fontWeight: 700,
                              borderRadius: 999,
                              px: 0.5,
                            }}
                          />
                        )}
                        {news.newsSentiment && (
                          <Chip
                            size="small"
                            label={
                              String(news.newsSentiment)
                                .charAt(0)
                                .toUpperCase() +
                              String(news.newsSentiment).slice(1).toLowerCase()
                            }
                            color={sentimentColor}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>
                    {news.neswCoinImpact && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          mt: 1,
                          py: 0.5,
                          px: 1,
                          borderRadius: 1.5,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(15,23,42,0.9)"
                              : "rgba(15,23,42,0.03)",
                        }}
                      >
                        <Avatar
                          src={news.neswCoinImpact.image}
                          alt={news.neswCoinImpact.name}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {news.neswCoinImpact.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (
                          {String(news.neswCoinImpact.symbol ?? "")
                            .toUpperCase()
                            .trim()}
                          )
                        </Typography>
                      </Stack>
                    )}
                    {news.newsDescription && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {news.newsDescription}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1.5, marginTop: "auto" }}
                    >
                      Published{" "}
                      {convertTime(news.newsPublishedAt) ||
                        news.newsPublishedAt}
                    </Typography>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>

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
