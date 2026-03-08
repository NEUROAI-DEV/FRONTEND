import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

/* ============================================================
   API: GET baseUrl/watchlist?vs_currency=usd
   Response: { success, message, data: { items: [...] }, meta }
   Service returns result.data.data → { items }
============================================================ */
export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number | null;
}

/** Same shape as API screeners?category=markets response items */
interface MarketCoinItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number | null;
}

const MODAL_PAGE_SIZE = 10;

export default function ListWatchListView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState<MarketCoinItem[]>([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalTotalItems, setModalTotalItems] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await handleGetRequest({
        path: "/watchlist?vs_currency=usd",
      });

      const list =
        result?.items && Array.isArray(result.items) ? result.items : [];
      setItems(list as WatchlistItem[]);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e?.message || "Gagal memuat watchlist.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchModalMarkets = async (page: number) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const path = `/screeners?category=markets&page=${page}&size=${MODAL_PAGE_SIZE}&vs_currency=usd&order=market_cap_desc`;
      const result = await handleGetRequest({ path });
      const list =
        result?.items && Array.isArray(result.items) ? result.items : [];
      setModalItems(list as MarketCoinItem[]);
      setModalTotalItems(result?.totalItems ?? list.length);
      setModalTotalPages(
        Math.max(
          1,
          result?.totalPages ??
            Math.ceil((result?.totalItems ?? list.length) / MODAL_PAGE_SIZE),
        ),
      );
    } catch (err: unknown) {
      const e = err as Error;
      setModalError(e?.message || "Gagal memuat daftar koin.");
      setModalItems([]);
      setModalTotalPages(1);
      setModalTotalItems(0);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
    setSelectedIds(new Set());
    setModalPage(1);
    setModalError(null);
    fetchModalMarkets(1);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setSelectedIds(new Set());
    setModalPage(1);
    setModalItems([]);
  };

  const handleModalPageChange = (_: unknown, value: number) => {
    if (value < 1 || value > modalTotalPages) return;
    setModalPage(value);
    fetchModalMarkets(value);
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveWatchlist = async () => {
    const watchListCoinIds = Array.from(selectedIds).join(",");
    if (!watchListCoinIds) return;
    setSaveLoading(true);
    setModalError(null);
    try {
      await handlePostRequest({
        path: "/watchlist",
        body: { watchListCoinIds },
      });
      handleCloseAddModal();
      fetchWatchlist();
    } catch (err: unknown) {
      const e = err as Error;
      setModalError(e?.message || "Gagal menyimpan watchlist.");
    } finally {
      setSaveLoading(false);
    }
  };

  const borderColor = isDark ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0.08)";

  return (
    <Box sx={{ pb: 2, width: "100%", minWidth: 0 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Watch List",
            link: "/watch-list",
            icon: <IconMenus.watchList fontSize="small" />,
          },
          {
            label: "Daftar",
            link: "/watch-list",
            icon: undefined,
          },
        ]}
      />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: isDark ? "rgba(15,23,42,0.4)" : "background.paper",
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                letterSpacing: "-0.02em",
                color: "text.primary",
                fontFamily: "inherit",
              }}
            >
              Watch List
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              Daftar koin yang Anda pantau
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Add
            </Button>
          </Stack>
        </Stack>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mx: 2, mt: 2 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& .MuiTableCell-head": {
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "text.secondary",
                      borderBottomColor: borderColor,
                      py: 1.5,
                      bgcolor: isDark ? "rgba(15,23,42,0.6)" : "action.hover",
                    },
                  }}
                >
                  <TableCell align="center">#</TableCell>
                  <TableCell>Coin</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">24h %</TableCell>
                  <TableCell align="right">Market Cap</TableCell>
                  <TableCell align="right">Vol (24h)</TableCell>
                  <TableCell align="right">High 24h</TableCell>
                  <TableCell align="right">Low 24h</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 6, color: "text.secondary", borderColor }}
                    >
                      Tidak ada data watchlist.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => {
                    const change24h = row.price_change_percentage_24h ?? 0;
                    const isPositive = change24h >= 0;
                    const changeColor = isPositive ? "#22c55e" : "#ef4444";
                    return (
                      <TableRow
                        key={`${row.id}-${row.symbol}`}
                        hover
                        sx={{
                          "& .MuiTableCell-root": {
                            borderBottomColor: borderColor,
                            py: 1.5,
                            fontVariantNumeric: "tabular-nums",
                          },
                          "&:hover": {
                            bgcolor: isDark
                              ? "rgba(148,163,184,0.06)"
                              : "action.hover",
                          },
                        }}
                      >
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 28,
                              height: 22,
                              px: 1,
                              borderRadius: 1,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: isDark
                                ? "rgba(148,163,184,0.12)"
                                : "action.selected",
                            }}
                          >
                            {row.market_cap_rank}
                          </Box>
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
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: `1px solid ${borderColor}`,
                              }}
                            />
                            <Stack>
                              <Typography
                                fontWeight={700}
                                sx={{ fontSize: 14, lineHeight: 1.2 }}
                              >
                                {row.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: 11,
                                  letterSpacing: 0.5,
                                  fontFamily: "monospace",
                                }}
                              >
                                {String(row.symbol).toUpperCase()}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} sx={{ fontSize: 14 }}>
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
                                sx={{ fontSize: 16, color: changeColor }}
                              />
                            ) : (
                              <TrendingDownIcon
                                sx={{ fontSize: 16, color: changeColor }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: changeColor, fontSize: 13 }}
                            >
                              {isPositive ? "+" : ""}
                              {change24h.toFixed(2)}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.market_cap)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.total_volume)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.high_24h)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(row.low_24h)}
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
      </Paper>

      <Dialog
        open={addModalOpen}
        onClose={handleCloseAddModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${borderColor}`,
            bgcolor: isDark ? "rgba(15,23,42,0.98)" : "background.paper",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            borderBottom: `1px solid ${borderColor}`,
            pb: 2,
          }}
        >
          Tambah koin ke Watch List
        </DialogTitle>
        <DialogContent sx={{ pt: 2, px: 0 }}>
          {modalError && (
            <Alert
              severity="error"
              sx={{ mx: 2, mb: 2 }}
              onClose={() => setModalError(null)}
            >
              {modalError}
            </Alert>
          )}
          {modalLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 360, overflowY: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& .MuiTableCell-head": {
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          borderBottomColor: borderColor,
                          py: 1,
                          bgcolor: isDark
                            ? "rgba(15,23,42,0.6)"
                            : "action.hover",
                        },
                      }}
                    >
                      <TableCell padding="checkbox" />
                      <TableCell align="center">#</TableCell>
                      <TableCell>Coin</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">24h %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modalItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{
                            py: 4,
                            color: "text.secondary",
                            borderColor,
                          }}
                        >
                          Tidak ada data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      modalItems.map((row) => {
                        const change24h = row.price_change_percentage_24h ?? 0;
                        const isPositive = change24h >= 0;
                        const changeColor = isPositive ? "#22c55e" : "#ef4444";
                        const checked = selectedIds.has(row.id);
                        return (
                          <TableRow
                            key={`${row.id}-${row.symbol}`}
                            hover
                            onClick={() => toggleSelectId(row.id)}
                            sx={{
                              cursor: "pointer",
                              "& .MuiTableCell-root": {
                                borderBottomColor: borderColor,
                                py: 1,
                                fontVariantNumeric: "tabular-nums",
                              },
                              "&:hover": {
                                bgcolor: isDark
                                  ? "rgba(148,163,184,0.06)"
                                  : "action.hover",
                              },
                              bgcolor: checked
                                ? isDark
                                  ? "rgba(59,130,246,0.08)"
                                  : "rgba(59,130,246,0.06)"
                                : undefined,
                            }}
                          >
                            <TableCell
                              padding="checkbox"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={checked}
                                onChange={() => toggleSelectId(row.id)}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              {row.market_cap_rank}
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box
                                  component="img"
                                  src={row.image}
                                  alt={row.symbol}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `1px solid ${borderColor}`,
                                  }}
                                />
                                <Stack>
                                  <Typography
                                    fontWeight={600}
                                    sx={{ fontSize: 13, lineHeight: 1.2 }}
                                  >
                                    {row.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: 10,
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    {String(row.symbol).toUpperCase()}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                fontWeight={600}
                                sx={{ fontSize: 13 }}
                              >
                                {formatUSD(row.current_price)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  fontSize: 12,
                                  color: changeColor,
                                }}
                              >
                                {isPositive ? "+" : ""}
                                {change24h.toFixed(2)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {!modalLoading && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: `1px solid ${borderColor}`,
                    bgcolor: isDark ? "rgba(15,23,42,0.4)" : "action.hover",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total {modalTotalItems} koin • Halaman {modalPage} dari{" "}
                    {modalTotalPages}
                  </Typography>
                  <Pagination
                    color="primary"
                    size="small"
                    count={Math.max(1, modalTotalPages)}
                    page={modalPage}
                    onChange={handleModalPageChange}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    hidePrevButton={false}
                    hideNextButton={false}
                    sx={{ "& .MuiPagination-ul": { flexWrap: "nowrap" } }}
                  />
                </Stack>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            py: 2,
            borderTop: `1px solid ${borderColor}`,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseAddModal}
            disabled={saveLoading}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveWatchlist}
            disabled={saveLoading || selectedIds.size === 0}
            startIcon={
              saveLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {saveLoading ? "Menyimpan..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
