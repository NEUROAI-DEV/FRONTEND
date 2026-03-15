import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useTheme } from "@mui/material/styles";
import { useHttp } from "../../hooks/http";

type SmartWalletTracker = {
  smartWalletTrackerId: number;
  smartWalletTrackerSmartWalletId: number;
  smartWalletTrackerWalletAddress: string;
  smartWalletTrackerTokenName: string;
  smartWalletTrackerInflow: string;
  smartWalletTrackerOutflow: string;
};

type SmartWallet = {
  smartWalletId: number;
  smartWalletAddress: string;
  smartWalletName: string;
  smartWalletTrackers: SmartWalletTracker[];
  createdAt: string;
};

type SmartWalletListResponse = {
  items: SmartWallet[];
  totalItems: number;
  page: number;
  size: number;
  totalPages: number;
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

export default function ListSmartMoneyView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { handleGetRequest } = useHttp();

  const [items, setItems] = useState<SmartWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<SmartWallet | null>(
    null,
  );
  const size = 10;

  const fetchList = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await handleGetRequest({
        path: `/smart-wallets?page=${page - 1}&size=${size}`,
      });
      const data: SmartWalletListResponse = result?.data ?? result;
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
      setTotalItems(Number(data?.totalItems) ?? 0);
      setTotalPages(Number(data?.totalPages) ?? 1);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load smart money data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading && items.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={1.5}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Loading smart money...
        </Typography>
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

  if (items.length === 0) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        py={8}
        spacing={1.5}
        sx={{
          borderRadius: 2,
          border: `1px dashed ${isDark ? "rgba(148,163,184,0.25)" : "rgba(0,0,0,0.12)"}`,
          bgcolor: isDark ? "rgba(15,23,42,0.4)" : "rgba(0,0,0,0.02)",
        }}
      >
        <MonetizationOnIcon sx={{ fontSize: 48, color: "text.secondary" }} />
        <Typography variant="subtitle1" fontWeight={600}>
          No Smart Money data yet
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 360 }}
        >
          Track large wallets (exchanges, whales) and their token activity.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="body2" color="text.secondary">
          {totalItems} wallet{totalItems !== 1 ? "s" : ""} tracked
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          width: "100%",
        }}
      >
        {items.map((wallet) => (
          <WalletCard
            key={wallet.smartWalletId}
            wallet={wallet}
            isDark={isDark}
            onClick={() => setSelectedWallet(wallet)}
          />
        ))}
      </Box>

      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      <WalletDetailModal
        wallet={selectedWallet}
        isDark={isDark}
        onClose={() => setSelectedWallet(null)}
      />
    </Stack>
  );
}

function WalletCard({
  wallet,
  isDark,
  onClick,
}: {
  wallet: SmartWallet;
  isDark: boolean;
  onClick: () => void;
}) {
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    wallet.smartWalletTrackers.forEach((t) => {
      totalIn += Number(t.smartWalletTrackerInflow || 0);
      totalOut += Number(t.smartWalletTrackerOutflow || 0);
    });
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [wallet.smartWalletTrackers]);

  const tokenNames = wallet.smartWalletTrackers.map(
    (t) => t.smartWalletTrackerTokenName,
  );
  const netPositive = stats.net >= 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"}`,
        bgcolor: isDark ? "rgba(15,23,42,0.5)" : "background.paper",
      }}
    >
      <CardActionArea onClick={onClick} sx={{ display: "block" }}>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isDark ? "rgba(34,197,94,0.15)" : "success.light",
                  color: "success.main",
                }}
              >
                <MonetizationOnIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {wallet.smartWalletName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace", fontSize: 11 }}
                >
                  {wallet.smartWalletAddress.slice(0, 10)}...
                  {wallet.smartWalletAddress.slice(-8)}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                py: 1,
                px: 1.25,
                borderRadius: 1,
                bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)",
              }}
            >
              <Stack spacing={0.25} flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Inflow
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="success.main"
                >
                  {formatNumber(stats.totalIn)}
                </Typography>
              </Stack>
              <Stack spacing={0.25} flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Outflow
                </Typography>
                <Typography variant="body2" fontWeight={700} color="error.main">
                  {formatNumber(stats.totalOut)}
                </Typography>
              </Stack>
              <Stack spacing={0.25} flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Net
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {netPositive ? (
                    <TrendingUpIcon
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ fontSize: 16, color: "error.main" }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: netPositive ? "success.main" : "error.main" }}
                  >
                    {netPositive ? "+" : ""}
                    {formatNumber(stats.net)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Tokens tracked ({tokenNames.length})
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {tokenNames.length === 0 ? "—" : tokenNames.join(", ")}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function WalletDetailModal({
  wallet,
  isDark,
  onClose,
}: {
  wallet: SmartWallet | null;
  isDark: boolean;
  onClose: () => void;
}) {
  const open = Boolean(wallet);

  const stats = useMemo(() => {
    if (!wallet) return { totalIn: 0, totalOut: 0, net: 0 };
    let totalIn = 0;
    let totalOut = 0;
    wallet.smartWalletTrackers.forEach((t) => {
      totalIn += Number(t.smartWalletTrackerInflow || 0);
      totalOut += Number(t.smartWalletTrackerOutflow || 0);
    });
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [wallet]);

  const created = wallet
    ? new Date(wallet.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const handleCopy = () => {
    if (wallet) navigator.clipboard.writeText(wallet.smartWalletAddress);
  };

  if (!wallet) return null;

  const netPositive = stats.net >= 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: `1px solid ${isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.08)"}`,
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
          fontWeight: 700,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isDark ? "rgba(34,197,94,0.15)" : "success.light",
              color: "success.main",
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 22 }} />
          </Box>
          {wallet.smartWalletName}
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Wallet address
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {wallet.smartWalletAddress}
              </Typography>
              <Tooltip title="Copy address">
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Tracked since: {created}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Stack spacing={0.25} flex={1}>
              <Typography variant="caption" color="text.secondary">
                Total Inflow
              </Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">
                {formatNumber(stats.totalIn)}
              </Typography>
            </Stack>
            <Stack spacing={0.25} flex={1}>
              <Typography variant="caption" color="text.secondary">
                Total Outflow
              </Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">
                {formatNumber(stats.totalOut)}
              </Typography>
            </Stack>
            <Stack spacing={0.25} flex={1}>
              <Typography variant="caption" color="text.secondary">
                Net Flow
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {netPositive ? (
                  <TrendingUpIcon
                    sx={{ fontSize: 20, color: "success.main" }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{ fontSize: 20, color: "error.main" }}
                  />
                )}
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ color: netPositive ? "success.main" : "error.main" }}
                >
                  {netPositive ? "+" : ""}
                  {formatNumber(stats.net)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Token activity ({wallet.smartWalletTrackers.length})
            </Typography>

            {wallet.smartWalletTrackers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No token activity recorded.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>
                        Token
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, fontSize: 12 }}
                      >
                        Inflow
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, fontSize: 12 }}
                      >
                        Outflow
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, fontSize: 12 }}
                      >
                        Net
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wallet.smartWalletTrackers.map((t) => {
                      const inflow = Number(t.smartWalletTrackerInflow || 0);
                      const outflow = Number(t.smartWalletTrackerOutflow || 0);
                      const net = inflow - outflow;
                      const positive = net >= 0;
                      return (
                        <TableRow key={t.smartWalletTrackerId}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {t.smartWalletTrackerTokenName}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "success.main",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatNumber(inflow)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "error.main",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatNumber(outflow)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              fontFamily: "monospace",
                              color: positive ? "success.main" : "error.main",
                            }}
                          >
                            {positive ? "+" : ""}
                            {formatNumber(net)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
