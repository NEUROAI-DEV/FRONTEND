import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
import { Button, Chip, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ListAttendanceView() {
  const [tableData, setTableData] = useState([]);
  const { handleGetTableDataRequest } = useHttp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

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
      const result = await handleGetTableDataRequest({
        path: "/news",
        page: paginationModel.page,
        size: paginationModel.pageSize,
        filter: { search, startDate, endDate },
      });

      console.log(result);

      if (result && result?.items) {
        setTableData(result?.items);
        setRowCount(result.totalItems);
      }
    } catch (error: unknown) {
      console.error(error);
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

  const columns: GridColDef[] = [
    {
      field: "newsTitle",
      flex: 1,
      renderHeader: () => <strong>{"TITLE"}</strong>,
      valueGetter: (params) => params.row?.newsTitle || "_",
      editable: true,
    },
    {
      field: "newsDescription",
      flex: 1,
      renderHeader: () => <strong>{"DESCRIPTION"}</strong>,
      valueGetter: (params) => params.row?.newsDescription || "_",
      editable: true,
    },
    {
      field: "newsPublishedAt",
      renderHeader: () => <strong>{"PUBLISHED AT"}</strong>,
      flex: 1,
      editable: true,
      valueGetter: (params) => convertTime(params.row?.newsPublishedAt) || "_",
    },
    {
      field: "newsSentiment",
      renderHeader: () => <strong>{"SENTIMENT"}</strong>,
      flex: 1,
      editable: true,
      renderCell: (params) => {
        const status = params.value;
        let color: "default" | "primary" | "success" | "warning" | "error" =
          "default";
        switch (status) {
          case "NEGATIVE":
            color = "error";
            break;
          case "POSITIVE":
            color = "primary";
            break;
          case "NEUTRAL":
            color = "success";
            break;
          default:
            color = "default";
            break;
        }

        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            variant="outlined"
            color={color}
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{"DETAIL"}</strong>,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [<Chip label={"Detail"} color={"success"} variant="outlined" />];
      },
    },
  ];

  function CustomToolbar() {
    const initialSearch = searchParams.get("search") || "";
    const initialStartDate = searchParams.get("startDate") || "";
    const initialEndDate = searchParams.get("endDate") || "";

    const [search, setSearch] = useState<string>(initialSearch);
    const [startDate, setStartDate] = useState<string>(initialStartDate);
    const [endDate, setEndDate] = useState<string>(initialEndDate);

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
      setSearchParams(newSearchParams);
    };

    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
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
            placeholder="search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outlined" onClick={handleSearch}>
            Search
          </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "News",
            link: "/news",
            icon: <IconMenus.news fontSize="small" />,
          },
        ]}
      />
      <Box sx={{ width: "100%", "& .actions": { color: "text.secondary" } }}>
        <DataGrid
          rows={tableData}
          columns={columns}
          getRowId={(row) => row?.newsId}
          editMode="row"
          autoHeight
          sx={{ padding: 2 }}
          pageSizeOptions={[2, 5, 10, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{ toolbar: CustomToolbar }}
          rowCount={rowCount}
          paginationMode="server"
          loading={loading}
        />
      </Box>
    </Box>
  );
}
