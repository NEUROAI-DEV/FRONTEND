import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useHttp } from "../../hooks/http";
import { formatUSD } from "../../utilities/convertNumberToCurrency";

interface ISubscriptionPlan {
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  subscriptionPlanOrder: string;
  subscriptionPlanDescription: string;
  subscriptionPlanPriceMonthly: string;
  subscriptionPlanPriceYearly: string;
  subscriptionPlanInterval: "MONTHLY" | "YEARLY" | string;
  subscriptionPlanCategory: "FREE" | "PAID" | string;
}

export default function ListSubscriptionPlanView() {
  const { handleGetRequest } = useHttp();

  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await handleGetRequest({
          path: "/subscription-plans",
        });
        const data = result?.data ?? result;
        const items: ISubscriptionPlan[] = data?.items ?? [];
        setPlans(items);
      } catch (err: unknown) {
        const e = err as Error;
        setErrorMessage(e?.message || "Gagal memuat subscription plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <Box sx={{ pb: 2, width: "100%", minWidth: 0 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Subscription",
            link: "/subscription-plans",
            icon: <IconMenus.summary fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Subscription Plans
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pilih paket yang sesuai dengan kebutuhan Anda.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ py: 8, width: "100%" }}
        >
          <CircularProgress size={32} />
        </Stack>
      ) : (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {plans.map((plan) => {
            const isFree = plan.subscriptionPlanCategory === "FREE";
            const monthlyPrice = Number(plan.subscriptionPlanPriceMonthly || 0);
            const yearlyPrice = Number(plan.subscriptionPlanPriceYearly || 0);

            return (
              <Grid item xs={12} sm={6} md={4} key={plan.subscriptionPlanId}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="h6" fontWeight={800}>
                        {plan.subscriptionPlanName}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          plan.subscriptionPlanCategory === "FREE"
                            ? "Free"
                            : "Premium"
                        }
                        color={isFree ? "default" : "primary"}
                        variant={isFree ? "outlined" : "filled"}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5, minHeight: 48 }}
                    >
                      {plan.subscriptionPlanDescription}
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 0.5,
                        }}
                      >
                        {formatUSD(
                          plan.subscriptionPlanInterval === "YEARLY"
                            ? yearlyPrice
                            : monthlyPrice,
                        )}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          /{" "}
                          {plan.subscriptionPlanInterval === "YEARLY"
                            ? "year"
                            : "month"}
                        </Typography>
                      </Typography>

                      {!isFree && monthlyPrice > 0 && yearlyPrice > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {formatUSD(monthlyPrice)} / month •{" "}
                          {formatUSD(yearlyPrice)} / year
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}

          {plans.length === 0 && !loading && !errorMessage && (
            <Grid item xs={12}>
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={600}>
                  Belum ada subscription plan yang tersedia.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
