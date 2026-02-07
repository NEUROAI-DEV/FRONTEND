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
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";

const DashboardView = () => {
  const theme = useTheme();
  const navigation = useNavigate();

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

        {/* Sentiment Analysis */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography fontWeight="bold">
                Market Sentiment Analysis
              </Typography>
              <Typography
                fontWeight="bold"
                color={sentiment.score > 60 ? "success.main" : "error.main"}
              >
                Score: {sentiment.score}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {[
              { label: "Twitter", value: sentiment.twitter },
              { label: "Reddit", value: sentiment.reddit },
              { label: "News", value: sentiment.news },
              { label: "Telegram", value: sentiment.telegram },
            ].map((item, i) => (
              <Box key={i} mb={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography
                    variant="body2"
                    color={item.value > 60 ? "success.main" : "error.main"}
                  >
                    {item.value}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    mt: 0.5,
                  }}
                />
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardView;
