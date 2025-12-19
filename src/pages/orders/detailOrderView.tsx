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
  Grid,
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
import {
  IConfirmShippingRequest,
  ICreateShippingDraftRequest,
} from "../../interfaces/Shipping";
import { IOrder, IOrderDetail } from "../../interfaces/Order";

export default function DetailOrderView() {
  const { handleGetRequest, handleUpdateRequest } = useHttp();
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [detailOrder, setDetailOrder] = useState<IOrderDetail | null>(null);
  const [orderStatus, setOrderStatus] = useState("");

  const getDetailOrder = async () => {
    const result: IOrderDetail = await handleGetRequest({
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

  const handleUpdateOrderToDraft = async () => {
    try {
      const payload: ICreateShippingDraftRequest = {
        orderId: orderId ? Number(orderId) : 0,
        courierCompany: detailOrder?.orderCourierCode ?? "",
        courierType: "reg",
        deliveryType: "now",
      };

      await handleUpdateRequest({ path: "/shipping/draft", body: payload });
      getDetailOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateConfirmDraft = async () => {
    try {
      const payload: IConfirmShippingRequest = {
        orderId: orderId ? Number(orderId) : 0,
      };

      await handleUpdateRequest({
        path: "/shipping/draft/confirm",
        body: payload,
      });
      getDetailOrder();
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
                    src={
                      "https://jasaapk.us/file-server/api/uploads/vitamin1-1762730459122.jpg"
                    }
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

        {detailOrder.orderStatus === "process" && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button variant="contained" onClick={handleUpdateOrderToDraft}>
              Buat Draft Pengiriman
            </Button>
          </Stack>
        )}

        {detailOrder.orderStatus === "draft" && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button variant="contained" onClick={handleUpdateConfirmDraft}>
              Kirim Pesanan
            </Button>
          </Stack>
        )}
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
