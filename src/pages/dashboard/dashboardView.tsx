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
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

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
  const navigation = useNavigate();
  const { handleGetRequest } = useHttp();

  const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(
    null,
  );
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(
    null,
  );

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

  /* ================= DUMMY DATA ================= */

  const btcPrice = [555, 655, 5980, 6120, 62500, 6180, 6100];
  const usdIndex = [100, 101, 100.5, 55002, 6030, 1002.3, 101.8];

  const marketTrend = [61000, 61800, 63000, 62500, 64000, 65000, 64800];

  const sentiment = {
    score: 78,
    twitter: 82,
    reddit: 76,
    news: 42,
    telegram: 79,
  };

  const summaryCards = [
    {
      title: "BTC Price",
      value: "$61,245",
      icon: <IconMenus.token fontSize="large" />,
      color: "#00E396",
    },
    {
      title: "ETH Price",
      value: "$3,412",
      icon: <IconMenus.dashboard fontSize="large" />,
      color: "#775DD0",
    },
    {
      title: "BNB",
      value: "$585",
      icon: <IconMenus.settings fontSize="large" />,
      color: "#FEB019",
    },
    {
      title: "XRP",
      value: "$0.52",
      icon: <IconMenus.academy fontSize="large" />,
      color: "#008FFB",
    },
  ];

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Dashboard",
            link: "/",
            icon: <IconMenus.dashboard fontSize="small" />,
          },
        ]}
      />

      {/* ================= SUMMARY ================= */}
      <Grid container spacing={3} mb={3}>
        {summaryCards.map((item, i) => (
          <Grid item md={3} sm={6} xs={12} key={i}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                // background: "linear-gradient(135deg,#0f172a,#020617)",
                color: "white",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  sx={{
                    bgcolor: `${item.color}33`,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </IconButton>
                <Box>
                  <Typography variant="body2" color="gray">
                    {item.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= CHART SECTION ================= */}
      <Grid container spacing={3}>
        {/* BTC vs USD */}
        <Grid item md={7} xs={12}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight="bold" mb={2}>
              BTC vs USD Price
            </Typography>

            <ReactApexChart
              type="area"
              height={320}
              series={[
                { name: "BTC Price", data: btcPrice },
                { name: "USD Index", data: usdIndex },
              ]}
              options={{
                chart: { toolbar: { show: false } },
                stroke: { curve: "smooth", width: 2 },
                dataLabels: { enabled: false },
                colors: ["#00E396", "#008FFB"],
                fill: {
                  type: "gradient",
                  gradient: {
                    opacityFrom: 0.35,
                    opacityTo: 0.05,
                  },
                },
                xaxis: {
                  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                },
                legend: {
                  labels: {
                    colors: theme.palette.text.secondary,
                  },
                },
              }}
            />
          </Card>
        </Grid>

        {/* Market Trend */}
        <Grid item md={5} xs={12}>
          <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography fontWeight="bold" mb={2}>
              Market Trend (7D)
            </Typography>

            <ReactApexChart
              type="line"
              height={320}
              series={[
                {
                  name: "Market Trend",
                  data: marketTrend,
                },
              ]}
              options={{
                chart: { toolbar: { show: false } },
                stroke: { curve: "smooth", width: 3 },
                colors: ["#775DD0"],
                markers: { size: 4 },
                xaxis: {
                  categories: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* ================= DAILY MARKET SUMMARY (API) ================= */}
      <Grid container spacing={3} my={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
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
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardView;
