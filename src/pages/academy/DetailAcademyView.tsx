import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import { convertTime } from "../../utilities/convertTime";

/* ============================================================
   API: baseUrl/articles/detail/:articleId
   Response: { data: { articleId, articleTitle, articleDescription, ... } }
============================================================ */
interface ArticleDetailData {
  articleId: number;
  articleTitle: string;
  articleDescription: string;
  articleImage: string | null;
  createdAt?: string;
}

export default function DetailAcademyView() {
  const { articleId } = useParams<{ articleId: string }>();
  const { handleGetRequest } = useHttp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ArticleDetailData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      setErrorMessage("Invalid article ID.");
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await handleGetRequest({
          path: `/articles/detail/${articleId}`,
        });

        if (!cancelled && result) {
          setData({
            articleId: result.articleId,
            articleTitle: result.articleTitle ?? "",
            articleDescription: result.articleDescription ?? "",
            articleImage: result.articleImage ?? null,
            createdAt: result.createdAt,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setErrorMessage("Failed to load article.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

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
              label: "Academy",
              link: "/academy",
              icon: <IconMenus.academy fontSize="small" />,
            },
            {
              label: "Detail",
              link: `/academy/${articleId ?? ""}`,
              icon: undefined,
            },
          ]}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage ?? "Article not found."}
        </Alert>
      </Box>
    );
  }

  const imageUrl = getImageUrl(data.articleImage) || null;
  const createdLabel = data.createdAt ? convertTime(data.createdAt) : "—";

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Academy",
            link: "/academy",
            icon: <IconMenus.academy fontSize="small" />,
          },
          {
            label: "Detail",
            link: `/academy/${articleId ?? ""}`,
            icon: undefined,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={data.articleTitle}
              sx={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: 2,
                mb: 1,
              }}
            />
          )}

          <Stack spacing={0.75}>
            <Typography variant="h4" fontWeight={800}>
              {data.articleTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Published: {createdLabel}
            </Typography>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {data.articleDescription}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
