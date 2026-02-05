import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Chip, Stack, Typography } from "@mui/material";
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

export default function ListTopSignalsView() {
  const { handleGetRequest } = useHttp();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TableRow[]>([]);

  /**
   * Fetch data from API
   */
  const fetchSignals = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error(error);
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
  const filteredData = useMemo(() => {
    if (activeTab === "GAINERS") {
      return data.filter((d) => d.type === "GAINER");
    }

    if (activeTab === "LOSERS") {
      return data.filter((d) => d.type === "LOSER");
    }

    return data;
  }, [activeTab, data]);

  /**
   * Table columns
   */
  const columns: GridColDef[] = [
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 1,
    },
    {
      field: "changePercent",
      headerName: "24h Change (%)",
      flex: 1,
      renderCell: (params) => {
        const value = params.value as number;
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
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Top Signals",
            link: "/top-signals",
            icon: <IconMenus.token fontSize="small" />,
          },
        ]}
      />{" "}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="All Coins" value="ALL" />
        <Tab label="Gainers" value="GAINERS" />
        <Tab label="Losers" value="LOSERS" />
      </Tabs>
      {/* Table */}
      <Box sx={{ width: "100%", "& .actions": { color: "text.secondary" } }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          autoHeight
          loading={loading}
          sx={{ padding: 2 }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
