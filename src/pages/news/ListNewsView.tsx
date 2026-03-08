import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
import {
  Alert,
  Button,
  Chip,
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
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function NoRowsOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100%", py: 6, px: 2 }}
      spacing={0.5}
    >
      <Typography fontWeight={700}>{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function ListNewsView() {
  const [tableData, setTableData] = useState([]);
  const { handleGetTableDataRequest } = useHttp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getTableData = async ({
    search,
    startDate,
    endDate,
  }: {
    search: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await handleGetTableDataRequest({
        path: "/news",
        page: paginationModel.page,
        size: paginationModel.pageSize,
        filter: { search, startDate, endDate },
      });

      if (result && result?.items) {
        setTableData(result?.items);
        setRowCount(result.totalItems);
        setLastUpdated(new Date());
      }
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    getTableData({
      search,
      startDate,
      endDate,
    });
  }, [paginationModel, searchParams]);

  function CustomToolbar() {
    const initialSearch = searchParams.get("search") || "";
    const initialStartDate = searchParams.get("startDate") || "";
    const initialEndDate = searchParams.get("endDate") || "";

    const [search, setSearch] = useState<string>(initialSearch);
    const [startDate, setStartDate] = useState<string>(initialStartDate);
    const [endDate, setEndDate] = useState<string>(initialEndDate);

    useEffect(() => {
      setSearch(searchParams.get("search") || "");
      setStartDate(searchParams.get("startDate") || "");
      setEndDate(searchParams.get("endDate") || "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSearch = () => {
      const newSearchParams = new URLSearchParams();
      if (search) {
        newSearchParams.set("search", search);
      }
      if (startDate) {
        newSearchParams.set("startDate", startDate);
      }
      if (endDate) {
        newSearchParams.set("endDate", endDate);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(newSearchParams);
    };

    const handleReset = () => {
      setSearch("");
      setStartDate("");
      setEndDate("");
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(new URLSearchParams());
    };

    return (
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={() => getTableData({ search, startDate, endDate })}
                disabled={loading}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Tooltip title="Clear">
                    <IconButton
                      size="small"
                      onClick={() => setSearch("")}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={handleSearch}>
              Apply
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleReset}
              startIcon={<RestartAltIcon fontSize="small" />}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "News",
            link: "/news",
            icon: <IconMenus.news fontSize="small" />,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              News
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest crypto news and sentiment
              {lastUpdated ? ` • Updated ${lastUpdated.toLocaleString()}` : ""}
            </Typography>
          </Box>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ width: "100%" }}>
          <CustomToolbar />

          {(!loading && tableData.length === 0) || rowCount === 0 ? (
            <NoRowsOverlay
              title="No news"
              subtitle="Try adjusting your date range or search keyword."
            />
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {tableData.map((row: any) => {
                const publishedAt =
                  convertTime(row?.newsPublishedAt) || "Unknown date";
                const sentiment = String(row?.newsSentiment ?? "UNKNOWN");
                let sentimentColor:
                  | "default"
                  | "primary"
                  | "success"
                  | "warning"
                  | "error" = "default";
                switch (sentiment) {
                  case "NEGATIVE":
                    sentimentColor = "error";
                    break;
                  case "POSITIVE":
                    sentimentColor = "primary";
                    break;
                  case "NEUTRAL":
                    sentimentColor = "success";
                    break;
                  default:
                    sentimentColor = "default";
                }

                return (
                  <Grid item xs={12} md={6} key={row?.newsId}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        height: "100%",
                        borderRadius: 2,
                        borderColor: "divider",
                        transition:
                          "box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "primary.light",
                        },
                      }}
                    >
                      <Stack spacing={1} sx={{ height: "100%" }}>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            sx={{
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {row?.newsTitle || "-"}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              sentiment.charAt(0).toUpperCase() +
                              sentiment.slice(1).toLowerCase()
                            }
                            color={sentimentColor}
                            variant="outlined"
                          />
                        </Stack>

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
                          {row?.newsDescription || "-"}
                        </Typography>

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                          sx={{ mt: "auto" }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Published at {publishedAt}
                          </Typography>

                          <Button
                            size="small"
                            onClick={() => navigate(`/news/${row?.newsId}`)}
                          >
                            detail
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {rowCount > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {tableData.length} of {rowCount} items
              </Typography>

              <Pagination
                color="primary"
                shape="rounded"
                page={paginationModel.page + 1}
                count={Math.max(
                  1,
                  Math.ceil(rowCount / paginationModel.pageSize),
                )}
                onChange={(_, page) =>
                  setPaginationModel((prev) => ({ ...prev, page: page - 1 }))
                }
              />
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
