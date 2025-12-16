/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import {
  IOrdersModel,
  IOrdersUpdateRequestModel,
} from "../../models/ordersModel";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";
import { Carousel } from "react-responsive-carousel";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";

export default function DetailOrderView() {
  const { handleGetRequest, handleUpdateRequest } = useHttp();
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [detailOrder, setDetailOrder] = useState<IOrdersModel | null>(null);
  const [orderStatus, setOrderStatus] = useState("");

  const getDetailOrder = async () => {
    const result: IOrdersModel = await handleGetRequest({
      path: "/orders/detail/" + orderId,
    });

    if (result) {
      setDetailOrder(result);
      setOrderStatus(result.orderStatus);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload: IOrdersUpdateRequestModel = {
        orderId: orderId ?? "",
        orderStatus,
      };

      await handleUpdateRequest({ path: "/orders", body: payload });
      navigate("/orders");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDetailOrder();
  }, []);

  if (!detailOrder) return null;

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Orders",
            link: "/orders",
            icon: <IconMenus.orders fontSize="small" />,
          },
          {
            label: "Detail",
            link: "/orders/detail/" + orderId,
          },
        ]}
      />

      <Card sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* ================= IMAGE / CAROUSEL ================= */}
          <Grid item xs={12} md={5}>
            <Carousel showThumbs={false}>
              {(detailOrder.orderItems ?? []).map((item, index) => (
                <Box key={index}>
                  <img
                    src={getImageUrl(item.product.productImages[0] ?? "")}
                    alt={item.productNameSnapshot}
                    style={{ maxHeight: 400, objectFit: "contain" }}
                  />
                </Box>
              ))}
            </Carousel>
          </Grid>

          {/* ================= ORDER DETAIL ================= */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Detail Pesanan
            </Typography>

            <Stack spacing={1}>
              <Info label="Pembeli" value={detailOrder.user?.userName} />
              <Info
                label="WhatsApp"
                value={detailOrder.user?.userWhatsAppNumber}
              />
              <Info
                label="Status"
                value={<Chip label={detailOrder.orderStatus} color="primary" />}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Item Pesanan
            </Typography>

            {detailOrder.orderItems.map((item) => (
              <Box key={item.orderItemId} sx={{ mb: 1 }}>
                <Typography fontWeight={600}>
                  {item.productNameSnapshot}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} x Rp
                  {convertNumberToCurrency(Number(item.productPriceSnapshot))}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Info
                label="Subtotal"
                value={`Rp ${convertNumberToCurrency(
                  Number(detailOrder.orderSubtotal)
                )}`}
              />
              <Info
                label="Ongkir"
                value={`Rp ${convertNumberToCurrency(
                  Number(detailOrder.orderShippingFee)
                )}`}
              />
              <Info
                label="Total"
                value={`Rp ${convertNumberToCurrency(
                  Number(detailOrder.orderGrandTotal)
                )}`}
                bold
              />
            </Stack>
          </Grid>
        </Grid>

        {/* ================= ADDRESS ================= */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Alamat Pengiriman
        </Typography>

        <Stack spacing={1}>
          <Info label="Nama" value={detailOrder.address?.addressUserName} />
          <Info label="Kontak" value={detailOrder.address?.addressKontak} />
          <Info label="Alamat" value={detailOrder.address?.addressDetail} />
          <Info
            label="Wilayah"
            value={`${detailOrder.address?.addressKecamatan}, ${detailOrder.address?.addressKabupaten}, ${detailOrder.address?.addressProvinsi}`}
          />
          <Info
            label="Kode Pos"
            value={detailOrder.address?.addressPostalCode}
          />
        </Stack>

        {/* ================= UPDATE STATUS ================= */}
        <Divider sx={{ my: 4 }} />
        <FormControl>
          <FormLabel>Status Pesanan</FormLabel>
          <RadioGroup
            row
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            {["waiting", "process", "delivery", "done", "cancel"].map(
              (status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={status}
                />
              )
            )}
          </RadioGroup>
        </FormControl>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleUpdate}>
            Update Status
          </Button>
        </Stack>
      </Card>
    </>
  );
}

/* ================= REUSABLE INFO ROW ================= */
function Info({
  label,
  value,
  bold,
}: {
  label: string;
  value: any;
  bold?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={bold ? 700 : 400}>{value}</Typography>
    </Stack>
  );
}
