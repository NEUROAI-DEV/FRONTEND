import { Box, Chip, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { useMemo } from "react";

/* =========================================================
   DUMMY DATA
========================================================= */
const rows: GridRowsProp = [
  {
    id: 1,
    chain: "ETH",
    token: "USDC",
    price: 1.0,
    change24h: -0.01,
    mcap: 1470000000,
    volume: 11090000,
    liquidity: 19860000,
    buy: 6700000,
    sell: 4390000,
    flow: 2310000,
  },
  {
    id: 2,
    chain: "BSC",
    token: "BUSD",
    price: 0.94,
    change24h: -0.41,
    mcap: 493090000,
    volume: 1570000,
    liquidity: 26440000,
    buy: 1390000,
    sell: 184850,
    flow: 1200000,
  },
  {
    id: 3,
    chain: "ETH",
    token: "WETH",
    price: 2970,
    change24h: 1.66,
    mcap: 241970000,
    volume: 51290000,
    liquidity: 5010000,
    buy: 25990000,
    sell: 25300000,
    flow: 691800,
  },
  {
    id: 4,
    chain: "SOL",
    token: "BONK",
    price: 0.000821,
    change24h: -0.27,
    mcap: 674690000,
    volume: 1060000,
    liquidity: 2730000,
    buy: 653730,
    sell: 407530,
    flow: 246210,
  },
];

/* =========================================================
   HELPER FORMAT
========================================================= */
const formatUSD = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const formatCompact = (value: number) =>
  `$${Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)}`;

/* =========================================================
   TOOLBAR
========================================================= */
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <Typography fontWeight={600}>Token Scanner</Typography>
    </GridToolbarContainer>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function ListTokenScreenerView() {
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "chain",
        headerName: "Chain",
        width: 90,
        renderCell: (params) => (
          <Chip label={params.value} size="small" variant="outlined" />
        ),
      },
      {
        field: "token",
        headerName: "Token",
        width: 120,
        renderCell: (params) => (
          <Typography fontWeight={600}>{params.value}</Typography>
        ),
      },
      {
        field: "price",
        headerName: "Price",
        width: 120,
        renderCell: (params) => formatUSD(params.value),
      },
      {
        field: "change24h",
        headerName: "Chg 24h",
        width: 110,
        renderCell: (params) => (
          <Typography
            fontWeight={600}
            color={params.value >= 0 ? "success.main" : "error.main"}
          >
            {params.value > 0 ? "+" : ""}
            {params.value}%
          </Typography>
        ),
      },
      {
        field: "mcap",
        headerName: "MCap",
        width: 130,
        renderCell: (params) => formatCompact(params.value),
      },
      {
        field: "volume",
        headerName: "DEX Volume",
        width: 140,
        renderCell: (params) => formatCompact(params.value),
      },
      {
        field: "liquidity",
        headerName: "Liquidity",
        width: 140,
        renderCell: (params) => formatCompact(params.value),
      },
      {
        field: "buy",
        headerName: "DEX Buys",
        width: 130,
        renderCell: (params) => formatCompact(params.value),
      },
      {
        field: "sell",
        headerName: "DEX Sells",
        width: 130,
        renderCell: (params) => formatCompact(params.value),
      },
      {
        field: "flow",
        headerName: "DEX Flow",
        width: 130,
        renderCell: (params) => (
          <Typography
            fontWeight={600}
            color={params.value >= 0 ? "success.main" : "error.main"}
          >
            {formatCompact(params.value)}
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar }}
        sx={{
          borderRadius: 2,
          backgroundColor: "background.paper",
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: 700,
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid",
            borderColor: "divider",
          },
        }}
      />
    </Box>
  );
}
