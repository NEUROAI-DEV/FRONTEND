import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";

/* ============================================================
   Data: baseUrl/screeners
   Response: { data: { items, totalItems, totalPages, currentPage } }
   API TYPES
============================================================ */
interface EntryZone {
  buy: string;
  sell: string;
}

interface Analysis {
  symbol: string;
  profile: string;
  trend: string;
  confidence: number;
  entryZone: EntryZone;
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
}

interface ScreenerItem {
  screenerId: number;
  screenerUserId: number;
  screenerCoinSymbol: string;
  screenerProfile: string;
  analysis: Analysis;
  createdAt?: string;
  updatedAt?: string;
}

interface ScreenerRow {
  id: number;
  screenerId: number;
  symbol: string;
  profile: string;
  trend: string;
  confidence: number;
  entryBuy: string;
  entrySell: string;
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
  createdAt: string;
}

/** markets/coins response item */
interface CoinItem {
  symbol: string;
  baseAsset: string;
}

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

const SCREENER_PROFILES = ["SCALPING", "SWING", "DAY_TRADING"] as const;

function ScreenerToolbar({
  query,
  onQueryChange,
  onRefresh,
  onAddCoin,
  loading,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onRefresh: () => void;
  onAddCoin: () => void;
  loading: boolean;
}) {
  return (
    <GridToolbarContainer sx={{ px: 0, py: 0 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            size="small"
            placeholder="Search symbol (e.g. ETHUSDT)"
            sx={{ maxWidth: 420 }}
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
                      onClick={() => onQueryChange("")}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddCoin}
            sx={{ whiteSpace: "nowrap" }}
          >
            Add Coin
          </Button>
        </Stack>
        <Tooltip title="Refresh">
          <span>
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              size="small"
              sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </GridToolbarContainer>
  );
}

function mapItemToRow(item: ScreenerItem): ScreenerRow {
  const a = item.analysis || ({} as Analysis);
  const ez = a.entryZone || { buy: "-", sell: "-" };
  return {
    id: item.screenerId,
    screenerId: item.screenerId,
    symbol: item.screenerCoinSymbol || a.symbol || "-",
    profile: item.screenerProfile || a.profile || "-",
    trend: a.trend || "-",
    confidence: typeof a.confidence === "number" ? a.confidence : 0,
    entryBuy: ez.buy ?? "-",
    entrySell: ez.sell ?? "-",
    stopLoss: a.stopLoss ?? "-",
    takeProfit: a.takeProfit ?? "-",
    reasoning: a.reasoning ?? "",
    createdAt: item.createdAt ?? "-",
  };
}

export default function ListScreenerView() {
  const { handleGetTableDataRequest, handleGetRequest, handlePostRequest } =
    useHttp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScreenerRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [coinSearch, setCoinSearch] = useState("");
  const [coinPage, setCoinPage] = useState(1);
  const [coins, setCoins] = useState<CoinItem[]>([]);
  const [coinsTotal, setCoinsTotal] = useState(0);
  const [coinsTotalPages, setCoinsTotalPages] = useState(1);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinItem | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<(typeof SCREENER_PROFILES)[number]>("SCALPING");
  const [saving, setSaving] = useState(false);
  const [debouncedCoinSearch, setDebouncedCoinSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCoinSearch(coinSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [coinSearch]);

  const fetchCoins = async () => {
    setLoadingCoins(true);
    try {
      const path = `/markets/coins?search=${encodeURIComponent(debouncedCoinSearch)}&page=${coinPage}&limit=20`;
      const result = await handleGetRequest({ path });
      if (result?.items) {
        setCoins(result.items as CoinItem[]);
        setCoinsTotal(result.totalItems ?? 0);
        setCoinsTotalPages(result.totalPages ?? 1);
      } else {
        setCoins([]);
        setCoinsTotal(0);
        setCoinsTotalPages(1);
      }
    } catch {
      setCoins([]);
      setCoinsTotal(0);
      setCoinsTotalPages(1);
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => {
    if (!openAddModal) return;
    fetchCoins();
  }, [openAddModal, debouncedCoinSearch, coinPage]);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setCoinSearch("");
    setCoinPage(1);
    setSelectedCoin(null);
    setSelectedProfile("SCALPING");
    setDebouncedCoinSearch("");
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setSelectedCoin(null);
  };

  const handleSaveAddCoin = async () => {
    if (!selectedCoin || saving) return;
    setSaving(true);
    try {
      await handlePostRequest({
        path: "/screeners",
        body: {
          screenerCoinSymbol: selectedCoin.symbol,
          screenerProfile: selectedProfile,
        },
      });
      handleCloseAddModal();
      fetchScreeners();
    } finally {
      setSaving(false);
    }
  };

  const fetchScreeners = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await handleGetTableDataRequest({
        path: "/screeners",
        page: paginationModel.page + 1,
        size: paginationModel.pageSize,
        filter: debouncedQuery ? { search: debouncedQuery } : undefined,
      });

      if (result?.items) {
        const rows = (result.items as ScreenerItem[]).map(mapItemToRow);
        setData(rows);
        setRowCount(result.totalItems ?? rows.length);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load screeners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreeners();
  }, [paginationModel.page, paginationModel.pageSize, debouncedQuery]);

  const filteredData = data;

  const columns: GridColDef<ScreenerRow>[] = [
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography fontWeight={700} sx={{ letterSpacing: 0.3 }}>
          {String(params.value ?? "").toUpperCase()}
        </Typography>
      ),
    },
    {
      field: "profile",
      headerName: "Profile",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={String(params.value ?? "-")}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "trend",
      headerName: "Trend",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => {
        const v = String(params.value ?? "").toUpperCase();
        const isBullish = v === "BULLISH" || v === "BULL";
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {isBullish ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              variant="body2"
              color={isBullish ? "success.main" : "error.main"}
              fontWeight={600}
            >
              {params.value ?? "-"}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "confidence",
      headerName: "Confidence",
      flex: 0.6,
      minWidth: 100,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {typeof params.value === "number"
            ? `${(params.value * 100).toFixed(0)}%`
            : "-"}
        </Typography>
      ),
    },
    {
      field: "entryBuy",
      headerName: "Entry (Buy)",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "entrySell",
      headerName: "Entry (Sell)",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "stopLoss",
      headerName: "Stop Loss",
      flex: 0.7,
      minWidth: 90,
    },
    {
      field: "takeProfit",
      headerName: "Take Profit",
      flex: 0.7,
      minWidth: 90,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 0.9,
      minWidth: 160,
    },
    {
      field: "reasoning",
      headerName: "Reasoning",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const text = String(params.value ?? "");
        const truncated =
          text.length > 80 ? `${text.slice(0, 80)}...` : text || "-";
        return (
          <Tooltip title={text || ""} enterDelay={300}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {truncated}
            </Typography>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Screeners",
            link: "/screeners",
            icon: <IconMenus.trend fontSize="small" />,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack spacing={1.25} alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Screeners
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analysis & entry zones
              {lastUpdated
                ? ` • Updated ${lastUpdated.toLocaleString()}`
                : ""}
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
          <DataGrid
            rows={filteredData}
            columns={columns}
            autoHeight
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
            paginationMode="server"
            hideFooterSelectedRowCount
            slots={{
              toolbar: ScreenerToolbar,
              noRowsOverlay: () => (
                <NoRowsOverlay
                  title={query ? "No matches" : "No screeners"}
                  subtitle={
                    query
                      ? "Try a different symbol."
                      : "No screener data available."
                  }
                />
              ),
            }}
            slotProps={{
              toolbar: {
                query,
                onQueryChange: setQuery,
                onRefresh: fetchScreeners,
                onAddCoin: handleOpenAddModal,
                loading,
              },
            }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "background.default",
                borderRadius: 1,
              },
              "& .MuiDataGrid-cell": { py: 1 },
              "& .MuiDataGrid-row:hover": { bgcolor: "action.hover" },
              "& .MuiDataGrid-footerContainer": { borderTopColor: "divider" },
            }}
          />
        </Box>

        <Dialog
          open={openAddModal}
          onClose={handleCloseAddModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>Add Coin to Screener</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search coin (e.g. BTC)"
                value={coinSearch}
                onChange={(e) => {
                  setCoinSearch(e.target.value);
                  setCoinPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Profile</InputLabel>
                <Select
                  value={selectedProfile}
                  label="Profile"
                  onChange={(e) =>
                    setSelectedProfile(
                      e.target.value as (typeof SCREENER_PROFILES)[number]
                    )
                  }
                >
                  {SCREENER_PROFILES.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Select a coin
                </Typography>
                {loadingCoins ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </Stack>
                ) : coins.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No coins found. Try a different search.
                  </Typography>
                ) : (
                  <>
                    <List
                      dense
                      sx={{
                        maxHeight: 280,
                        overflow: "auto",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      {coins.map((coin) => (
                        <ListItemButton
                          key={coin.symbol}
                          selected={selectedCoin?.symbol === coin.symbol}
                          onClick={() => setSelectedCoin(coin)}
                        >
                          <ListItemText
                            primary={coin.symbol}
                            secondary={coin.baseAsset}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                    {coinsTotalPages > 1 && (
                      <Stack alignItems="center" sx={{ mt: 1.5 }}>
                        <Pagination
                          color="primary"
                          size="small"
                          count={coinsTotalPages}
                          page={coinPage}
                          onChange={(_, p) => setCoinPage(p)}
                        />
                      </Stack>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveAddCoin}
              disabled={!selectedCoin || saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
