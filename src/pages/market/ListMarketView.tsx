import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Tooltip } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { GeckoCoinItem } from "../../interfaces/Market";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

export default function ListMarketView() {
  const { handleGetRequest } = useHttp();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GeckoCoinItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCoins = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const path = `/markets/coins/gecko?vs_currency=usd&order=market_cap_desc&page=${page}&size=${size}`;

      const result = await handleGetRequest({ path });

      if (result?.items) {
        setItems(result.items as GeckoCoinItem[]);
        setTotalPages(Math.max(1, result.totalPages ?? 1));
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems([]);
      setErrorMessage("Failed to load market data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [page, size]);

  const filteredItems = query.trim()
    ? items.filter(
        (c) =>
          c.symbol?.toLowerCase().includes(query.trim().toLowerCase()) ||
          c.name?.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Market",
            link: "/market",
            icon: <IconMenus.trend fontSize="small" />,
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
                Coin Market
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top Trending Coins
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search by name or symbol..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ width: { xs: "100%", sm: 260 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Per page</InputLabel>
                <Select
                  value={size}
                  label="Per page"
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={fetchCoins}
                  disabled={loading}
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Coin</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      24h %
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Market Cap
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Volume (24h)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {query ? "No coins match your search." : "No data."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((row) => {
                      const change24 = row.price_change_percentage_24h ?? 0;
                      const isPositive = change24 >= 0;
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            {row.market_cap_rank}
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Box
                                component="img"
                                src={row.image}
                                alt={row.symbol}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <Stack>
                                <Typography fontWeight={700}>
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {String(row.symbol).toUpperCase()}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              {formatUSD(row.current_price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              {isPositive ? (
                                <TrendingUpIcon
                                  fontSize="small"
                                  color="success"
                                />
                              ) : (
                                <TrendingDownIcon
                                  fontSize="small"
                                  color="error"
                                />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  isPositive ? "success.main" : "error.main"
                                }
                              >
                                {change24 >= 0 ? "+" : ""}
                                {change24.toFixed(2)}%
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatUSD(row.market_cap)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatUSD(row.total_volume)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && items.length > 0 && totalPages > 1 && (
            <Stack alignItems="center" sx={{ pt: 2 }}>
              <Pagination
                color="primary"
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
