import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbarContainer,
} from "@mui/x-data-grid";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";

type TabType = "ALL" | "GAINERS" | "LOSERS";

interface TableRow {
  id: string;
  symbol: string;
  changePercent: number;
  type: "GAINER" | "LOSER";
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

function TopSignalsToolbar({
  query,
  onQueryChange,
  onRefresh,
  loading,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <GridToolbarContainer sx={{ px: 0, py: 0 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        // sx={{ width: "100%" }}
      >
        <TextField
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          size="small"
          placeholder="Search symbol (e.g. BTC)"
          sx={{ maxWidth: 420, py: 2 }}
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

        <Stack direction="row" spacing={1} alignItems="center">
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
      </Stack>
    </GridToolbarContainer>
  );
}

export default function ListTopSignalsView() {
  const { handleGetRequest } = useHttp();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TableRow[]>([]);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "changePercent", sort: "desc" },
  ]);

  /**
   * Fetch data from API
   */
  const fetchSignals = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await handleGetRequest({
        path: "/markets/top-signals",
      });

      const gainers: TableRow[] = res.gainers.map((g: any) => ({
        id: g.symbol,
        symbol: g.symbol,
        changePercent: g.changePercent,
        type: "GAINER",
      }));

      const losers: TableRow[] = res.losers.map((l: any) => ({
        id: l.symbol,
        symbol: l.symbol,
        changePercent: l.changePercent,
        type: "LOSER",
      }));

      setData([...gainers, ...losers]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load top signals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  /**
   * Filter data based on tab
   */
  const counts = useMemo(() => {
    const gainersCount = data.filter((d) => d.type === "GAINER").length;
    const losersCount = data.filter((d) => d.type === "LOSER").length;
    return { all: data.length, gainers: gainersCount, losers: losersCount };
  }, [data]);

  useEffect(() => {
    setSortModel([
      { field: "changePercent", sort: activeTab === "LOSERS" ? "asc" : "desc" },
    ]);
  }, [activeTab]);

  const filteredData = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (activeTab === "GAINERS") {
      const rows = data.filter((d) => d.type === "GAINER");
      return q ? rows.filter((r) => r.symbol.toUpperCase().includes(q)) : rows;
    }

    if (activeTab === "LOSERS") {
      const rows = data.filter((d) => d.type === "LOSER");
      return q ? rows.filter((r) => r.symbol.toUpperCase().includes(q)) : rows;
    }

    return q ? data.filter((r) => r.symbol.toUpperCase().includes(q)) : data;
  }, [activeTab, data, query]);

  /**
   * Table columns
   */
  const columns: GridColDef[] = [
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 1,
      minWidth: 160,
      sortable: true,
      renderCell: (params) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={800} sx={{ letterSpacing: 0.4 }}>
            {String(params.value ?? "").toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.type === "GAINER" ? "24h gainer" : "24h loser"}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "changePercent",
      headerName: "24h Change (%)",
      flex: 1,
      minWidth: 160,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const value = Number(params.value ?? 0);
        const isPositive = value >= 0;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {isPositive ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}

            <Typography
              variant="body2"
              color={isPositive ? "success.main" : "error.main"}
              fontWeight={600}
            >
              {isPositive ? "+" : ""}
              {value.toFixed(2)}%
            </Typography>
          </Stack>
        );
      },
    },

    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "GAINER" ? "success" : "error"}
          size="small"
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Top Signals",
            link: "/top-signals",
            icon: <IconMenus.token fontSize="small" />,
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
              Top Signals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              24h movers across the market
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

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            mb: 1.5,
            "& .MuiTab-root": { textTransform: "none", minHeight: 44 },
          }}
        >
          <Tab
            value="ALL"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>All</Typography>
                <Chip size="small" variant="outlined" label={counts.all} />
              </Stack>
            }
          />
          <Tab
            value="GAINERS"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>Gainers</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color="success"
                  label={counts.gainers}
                />
              </Stack>
            }
          />
          <Tab
            value="LOSERS"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>Losers</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color="error"
                  label={counts.losers}
                />
              </Stack>
            }
          />
        </Tabs>

        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            autoHeight
            loading={loading}
            disableRowSelectionOnClick
            sortModel={sortModel}
            onSortModelChange={(m) => setSortModel(m)}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            hideFooterSelectedRowCount
            getRowClassName={(params) =>
              params.row.type === "GAINER" ? "row--gainer" : "row--loser"
            }
            slots={{
              toolbar: TopSignalsToolbar,
              noRowsOverlay: () => (
                <NoRowsOverlay
                  title={query ? "No matches" : "No data"}
                  subtitle={
                    query
                      ? "Try a different symbol keyword."
                      : "There are no top signals available right now."
                  }
                />
              ),
            }}
            slotProps={{
              toolbar: {
                query,
                onQueryChange: setQuery,
                onRefresh: fetchSignals,
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
              "& .row--gainer .MuiDataGrid-cell": {
                bgcolor: "rgba(46, 125, 50, 0.03)",
              },
              "& .row--loser .MuiDataGrid-cell": {
                bgcolor: "rgba(211, 47, 47, 0.03)",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTopColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
