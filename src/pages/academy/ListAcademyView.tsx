import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { CONFIGS } from "../../configs";

/* ============================================================
   API: baseUrl/articles
   Response: { data: { items, totalItems, totalPages, currentPage } }
============================================================ */
interface ArticleItem {
  articleId: number;
  articleTitle: string;
  articleDescription: string;
  articleImage: string | null;
  createdAt?: string;
}

function getArticleImageUrl(
  articleImage: string | null | undefined,
): string | null {
  if (!articleImage) return null;
  if (articleImage.startsWith("http")) return articleImage;
  const base = CONFIGS.baseUrl || "";
  return base ? `${base.replace(/\/$/, "")}/uploads/${articleImage}` : null;
}

export default function ListAcademyView() {
  const { handleGetTableDataRequest } = useHttp();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await handleGetTableDataRequest({
          path: "/articles",
          page: page - 1,
          size: pageSize,
          filter: debouncedQuery ? { search: debouncedQuery } : undefined,
        });
        if (!cancelled && result?.items) {
          setItems(result.items as ArticleItem[]);
          setTotalItems(result.totalItems ?? 0);
          setTotalPages(Math.max(1, result.totalPages ?? 1));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage("Failed to load articles.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Academy",
            link: "/academy",
            icon: <IconMenus.academy fontSize="small" />,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Academy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Articles & learning resources
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear">
                      <IconButton
                        size="small"
                        onClick={() => setQuery("")}
                        edge="end"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Stack>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Divider />

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : items.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 8 }} spacing={1}>
              <MenuBookIcon sx={{ fontSize: 56 }} color="disabled" />
              <Typography fontWeight={600}>
                {debouncedQuery ? "No articles found" : "No articles yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {debouncedQuery
                  ? "Try a different search."
                  : "Check back later for new content."}
              </Typography>
            </Stack>
          ) : (
            <>
              <Grid container spacing={3}>
                {items.map((article) => {
                  const imageUrl = getArticleImageUrl(article.articleImage);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={article.articleId}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 2,
                          overflow: "hidden",
                          transition:
                            "box-shadow 0.2s ease, transform 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardActionArea
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                          }}
                          component="a"
                          href={`/academy/${article.articleId}`}
                        >
                          <CardMedia
                            component="img"
                            height="180"
                            image={
                              imageUrl ||
                              "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=240&fit=crop"
                            }
                            alt={article.articleTitle}
                            sx={{ bgcolor: "action.hover" }}
                          />
                          <CardContent sx={{ flexGrow: 1, py: 2 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {article.articleTitle}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {article.articleDescription || "No description."}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {totalPages > 1 && (
                <Stack alignItems="center" sx={{ pt: 3 }}>
                  <Pagination
                    color="primary"
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Page {page} of {totalPages} • {totalItems} article
                    {totalItems !== 1 ? "s" : ""}
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
