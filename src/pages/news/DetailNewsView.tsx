import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";

/* ============================================================
   API: baseUrl/news/detail/:newsId
   Response: { data: { newsTitle, newsDescription, ... } }
============================================================ */
interface NewsDetailData {
  newsId: number;
  newsTitle: string;
  newsDescription: string;
  newsCreatedAt: string;
  newsSentimentConfidence: string;
  newsSentiment: string;
  newsSentimentReason: string;
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

export default function DetailNewsView() {
  const { newsId } = useParams<{ newsId: string }>();
  const { handleGetRequest } = useHttp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NewsDetailData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!newsId) {
      setLoading(false);
      setErrorMessage("Invalid news ID.");
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await handleGetRequest({
          path: `/news/detail/${newsId}`,
        });

        if (!cancelled && result) {
          setData({
            newsId: result.newsId,
            newsTitle: result.newsTitle ?? "",
            newsDescription: result.newsDescription ?? "",
            newsCreatedAt: result.newsCreatedAt ?? "",
            newsSentimentConfidence: result.newsSentimentConfidence ?? "",
            newsSentiment: result.newsSentiment ?? "",
            newsSentimentReason: result.newsSentimentReason ?? "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setErrorMessage("Failed to load news detail.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage || !data) {
    return (
      <Box sx={{ pb: 2 }}>
        <BreadCrumberStyle
          navigation={[
            {
              label: "News",
              link: "/news",
              icon: <IconMenus.news fontSize="small" />,
            },
            { label: "Detail", link: `/news/${newsId}`, icon: undefined },
          ]}
        />
        <Alert severity="error">{errorMessage ?? "News not found."}</Alert>
      </Box>
    );
  }

  const sentimentColor = getSentimentColor(data.newsSentiment);
  const createdLabel = data.newsCreatedAt
    ? convertTime(data.newsCreatedAt)
    : "—";

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "News",
            link: "/news",
            icon: <IconMenus.news fontSize="small" />,
          },
          { label: "Detail", link: `/news/${newsId}`, icon: undefined },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800}>
            {data.newsTitle}
          </Typography>

          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Created: {createdLabel}
            </Typography>
            <Chip
              size="small"
              label={data.newsSentiment}
              color={sentimentColor}
              variant="outlined"
            />
            {data.newsSentimentConfidence && (
              <Typography variant="body2" color="text.secondary">
                Sentiment confidence: {data.newsSentimentConfidence}
              </Typography>
            )}
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {data.newsDescription}
            </Typography>
          </Box>

          {data.newsSentimentReason && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Sentiment reason
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {data.newsSentimentReason}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
