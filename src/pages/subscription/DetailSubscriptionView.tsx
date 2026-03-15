import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";

export default function DetailSubscriptionView() {
  return (
    <Box sx={{ pb: 2, width: "100%", minWidth: 0 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Subscription",
            link: "/subscription-plans",
            icon: <IconMenus.summary fontSize="small" />,
          },
          {
            label: "Payment Detail",
            link: "/subscription-detail",
            icon: undefined,
          },
        ]}
      />

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Subscription Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lakukan pembayaran sesuai instruksi di bawah ini untuk mengaktifkan
          langganan Anda.
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, borderColor: "divider" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Informasi Rekening Bank
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  BCA
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  1234 5678 90
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  a.n. PT Neuro AI Indonesia
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  BRI
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  9876 5432 10
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  a.n. PT Neuro AI Indonesia
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{ borderRadius: 3, borderColor: "divider" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Tata Cara Pembayaran
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" paragraph>
              Ikuti langkah-langkah berikut untuk menyelesaikan pembayaran
              subscription Anda:
            </Typography>

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  1. Transfer biaya langganan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lakukan transfer sesuai nominal yang tertera pada invoice ke
                  salah satu rekening BCA atau BRI di atas. Pastikan nama
                  penerima adalah <b>PT Neuro AI Indonesia</b>.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  2. Cantumkan berita / catatan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pada kolom berita / catatan transfer, tuliskan{" "}
                  <b>SUBSCRIPTION NEURO AI</b> diikuti dengan <b>nama Anda</b>{" "}
                  agar kami dapat memverifikasi pembayaran dengan cepat.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  3. Simpan bukti pembayaran
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Setelah transfer berhasil, simpan bukti pembayaran (screenshot
                  atau foto struk) untuk keperluan konfirmasi jika diperlukan.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  4. Aktivasi langganan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tim kami akan memverifikasi pembayaran Anda dalam waktu{" "}
                  <b>maksimal 1x24 jam kerja</b>. Setelah berhasil, akun Anda
                  akan otomatis dinaikkan ke status berlangganan aktif.
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 3 }}
            >
              Jika Anda mengalami kendala dalam proses pembayaran, silakan
              hubungi tim support kami melalui menu Chat di kanan bawah.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
