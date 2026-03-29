import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useHttp } from "../../hooks/http";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

type PredictItem = {
  predictId: number;
  predictUserId: number;
  predictSymbol: string;
  predictCoinIcon: string;
  predictType: string;
  predictPrice: string;
  predictTakeProfit: string;
  predictStopLoss: string;
  predictEntryPrice: string;
  predictReason: string;
  predictPotentialGain: string;
  predictPotentialLoss: string;
  predictionDirection: "BULLISH" | "BEARISH" | "NEUTRAL" | string;
  predictionLastUpdated: string;
};

type CoinItem = {
  coinId: number;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
};

export default function ListLivePredictView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest, handlePostRequest, handleRemoveRequest } =
    useHttp();

  const [items, setItems] = useState<PredictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0, // API uses 0-based pages: currentPage: 0, 1, ...
  });

  const [addOpen, setAddOpen] = useState(false);
  const [coins, setCoins] = useState<CoinItem[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [coinsError, setCoinsError] = useState<string | null>(null);
  const [coinQuery, setCoinQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CoinItem | null>(null);
  const [predictType, setPredictType] = useState<
    "SCALPING" | "SWING" | "INVESTING"
  >("SWING");
  const [runLoading, setRunLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PredictItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await handleGetRequest({
        path: `/predicts?page=${paginationModel.page}&size=${paginationModel.pageSize}&pagination=true`,
      });
      const data = result?.data ?? result;
      const list = data?.items && Array.isArray(data.items) ? data.items : [];
      setItems(list as PredictItem[]);
      setTotalItems(Number(data?.totalItems) ?? 0);
      setTotalPages(Number(data?.totalPages) ?? 1);
      if (Number.isFinite(Number(data?.currentPage))) {
        setPaginationModel((prev) => ({
          ...prev,
          page: Number(data.currentPage),
        }));
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal memuat data.",
      );
    } finally {
      setLoading(false);
    }
  }, [handleGetRequest, paginationModel.page, paginationModel.pageSize]);

  const fetchCoins = useCallback(async () => {
    setCoinsLoading(true);
    setCoinsError(null);
    try {
      const result = await handleGetRequest({ path: "/coins" });
      const data = result?.data ?? result;
      const list = data?.items && Array.isArray(data.items) ? data.items : [];
      setCoins(list as CoinItem[]);
    } catch (err) {
      setCoinsError(
        err instanceof Error ? err.message : "Failed to load coins.",
      );
    } finally {
      setCoinsLoading(false);
    }
  }, []);

  const openAddDialog = useCallback(() => {
    setAddOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddOpen(false);
    setCoinQuery("");
    setSelectedCoin(null);
    setPredictType("SWING");
    setCoinsError(null);
  }, []);

  useEffect(() => {
    if (!addOpen) return;
    if (coins.length > 0) return;
    fetchCoins();
  }, [addOpen, coins.length, fetchCoins]);

  const filteredCoins = useMemo(() => {
    const q = coinQuery.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) =>
        c.coinName.toLowerCase().includes(q) ||
        c.coinSymbol.toLowerCase().includes(q),
    );
  }, [coinQuery, coins]);

  const handleRunPrediction = useCallback(async () => {
    if (!selectedCoin || runLoading) return;
    setRunLoading(true);
    setCoinsError(null);
    try {
      await handlePostRequest({
        path: "/predicts/run",
        body: {
          type: predictType,
          symbol: selectedCoin.coinSymbol,
          icon: selectedCoin.coinImage || "",
        },
      });
      closeAddDialog();
      fetchList();
    } catch (err) {
      setCoinsError(
        err instanceof Error ? err.message : "Failed to run prediction.",
      );
    } finally {
      setRunLoading(false);
    }
  }, [
    closeAddDialog,
    fetchList,
    handlePostRequest,
    predictType,
    runLoading,
    selectedCoin,
  ]);

  const openDeleteDialog = useCallback((item: PredictItem) => {
    setDeleteTarget(item);
    setDeleteError(null);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  }, [deleteLoading]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await handleRemoveRequest({
        path: `/predicts/${deleteTarget.predictId}`,
      });
      closeDeleteDialog();

      if (items.length <= 1 && paginationModel.page > 0) {
        setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }));
        return;
      }

      fetchList();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete prediction.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [
    deleteLoading,
    deleteTarget,
    handleRemoveRequest,
    closeDeleteDialog,
    items.length,
    paginationModel.page,
    fetchList,
  ]);

  useEffect(() => {
    fetchList();
    const intervalId = setInterval(() => {
      fetchList();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchList]);

  if (loading && items.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Memuat prediksi...</Typography>
      </Stack>
    );
  }

  if (errorMessage && items.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{ width: "100%", maxWidth: "100%", paddingBottom: 10, px: 2 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight={800} sx={{ mr: 1 }}>
          Predicts
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Add
        </Button>
      </Stack>

      {items.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            border: `1px dashed ${isDark ? "rgba(148,163,184,0.35)" : "rgba(0,0,0,0.12)"}`,
            borderRadius: 3,
          }}
        >
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ maxWidth: 420, mx: "auto" }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={800}>
              No predictions yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              Your prediction signals will appear here once they are available.
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            width: "100%",
          }}
        >
          {items.map((item) => (
            <PredictCard
              key={item.predictId}
              item={item}
              isDark={isDark}
              onDelete={() => openDeleteDialog(item)}
            />
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {items.length} of {totalItems} items
          </Typography>

          <Pagination
            color="primary"
            shape="rounded"
            page={paginationModel.page + 1}
            count={Math.max(1, totalPages)}
            onChange={(_, page) =>
              setPaginationModel((prev) => ({ ...prev, page: page - 1 }))
            }
          />
        </Stack>
      )}

      <Dialog
        open={addOpen}
        onClose={runLoading ? undefined : closeAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${
              isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"
            }`,
            bgcolor: isDark ? "rgba(15,23,42,0.98)" : "background.paper",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 6,
            fontWeight: 800,
          }}
        >
          Run prediction
          <IconButton
            onClick={closeAddDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
            disabled={runLoading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.5}>
            {coinsError && <Alert severity="error">{coinsError}</Alert>}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                fullWidth
                size="small"
                label="Search coin"
                value={coinQuery}
                onChange={(e) => setCoinQuery(e.target.value)}
                placeholder="BTCUSDT, Bitcoin, ..."
              />
              <TextField
                select
                size="small"
                label="Type"
                value={predictType}
                onChange={(e) =>
                  setPredictType(
                    e.target.value as "SCALPING" | "SWING" | "INVESTING",
                  )
                }
                sx={{ width: { xs: "100%", sm: 160 } }}
              >
                <MenuItem value="SCALPING">SCALPING</MenuItem>
                <MenuItem value="SWING">SWING</MenuItem>
                <MenuItem value="INVESTING">INVESTING</MenuItem>
              </TextField>
            </Stack>

            <Divider />

            {coinsLoading ? (
              <Stack alignItems="center" py={3} spacing={1.5}>
                <CircularProgress size={22} />
                <Typography variant="body2" color="text.secondary">
                  Loading coins...
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                <List disablePadding>
                  {filteredCoins.map((coin) => {
                    const active = selectedCoin?.coinId === coin.coinId;
                    return (
                      <ListItemButton
                        key={coin.coinId}
                        selected={active}
                        onClick={() => setSelectedCoin(coin)}
                        sx={{
                          borderRadius: 1.5,
                          mb: 0.5,
                          border: `1px solid ${
                            active
                              ? "rgba(59,130,246,0.45)"
                              : isDark
                                ? "rgba(148,163,184,0.16)"
                                : "rgba(0,0,0,0.08)"
                          }`,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={coin.coinImage || undefined}
                            alt={coin.coinSymbol}
                            sx={{
                              width: 34,
                              height: 34,
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {!coin.coinImage
                              ? coin.coinSymbol.slice(0, 2)
                              : null}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              flexWrap="wrap"
                            >
                              <Typography fontWeight={800} variant="body2">
                                {coin.coinName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "monospace" }}
                              >
                                {coin.coinSymbol}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              Selected:{" "}
              {selectedCoin
                ? `${selectedCoin.coinName} (${selectedCoin.coinSymbol})`
                : "—"}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={closeAddDialog} disabled={runLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            disabled={!selectedCoin || runLoading}
            onClick={handleRunPrediction}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {runLoading ? "Running..." : "Run Prediction"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${
              isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"
            }`,
            bgcolor: isDark ? "rgba(15,23,42,0.98)" : "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Delete prediction?
          <IconButton
            onClick={closeDeleteDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
            aria-label="close"
            disabled={deleteLoading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete{" "}
              <Typography
                component="span"
                fontWeight={800}
                color="text.primary"
              >
                {deleteTarget?.predictSymbol || "this prediction"}
              </Typography>
              ?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function PredictCard({
  item,
  isDark,
  onDelete,
}: {
  item: PredictItem;
  isDark: boolean;
  onDelete: () => void;
}) {
  const entry = Number(item.predictEntryPrice || item.predictPrice || 0);
  const takeProfit = Number(item.predictTakeProfit || 0);
  const stopLoss = Number(item.predictStopLoss || 0);

  const potentialGain = Number(item.predictPotentialGain || 0);
  const potentialLoss = Number(item.predictPotentialLoss || 0);

  const direction = String(item.predictionDirection || "").toUpperCase();
  const directionColor =
    direction === "BULLISH"
      ? "success"
      : direction === "BEARISH"
        ? "error"
        : "default";

  const lastUpdated = useMemo(() => {
    const raw = item.predictionLastUpdated;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? raw : date.toLocaleString("en-US");
  }, [item.predictionLastUpdated]);

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${
          isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"
        }`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: isDark ? "rgba(15,23,42,0.4)" : "background.paper",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1.5}
            sx={{ mb: 0.5 }}
          >
            <Avatar
              src={item.predictCoinIcon || undefined}
              alt={item.predictSymbol}
              sx={{
                width: 32,
                height: 32,
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {!item.predictCoinIcon ? item.predictSymbol.slice(0, 2) : null}
            </Avatar>
            <Typography fontWeight={700} variant="subtitle1">
              {item.predictSymbol}
            </Typography>

            <Chip
              size="small"
              label={direction || "—"}
              color={directionColor}
              variant={isDark ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />

            <Chip
              size="small"
              label={item.predictType}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />

            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="small"
              onClick={onDelete}
              aria-label="delete"
              sx={{
                border: `1px solid ${
                  isDark ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0.08)"
                }`,
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1.25,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Entry
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatUSD(entry)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Take Profit
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatUSD(takeProfit)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Stop Loss
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatUSD(stopLoss)}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              {potentialGain >= 0 ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16, color: "error.main" }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: potentialGain >= 0 ? "success.main" : "error.main",
                  fontWeight: 700,
                }}
              >
                {potentialGain >= 0 ? "+" : ""}
                {potentialGain.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                potential gain
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendingDownIcon sx={{ fontSize: 16, color: "error.main" }} />
              <Typography
                variant="caption"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                {potentialLoss.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                potential loss
              </Typography>
            </Stack>
          </Stack>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Reason
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.predictReason || "—"}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
