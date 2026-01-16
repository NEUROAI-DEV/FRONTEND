import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Divider,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";

/* ============================================================
   DUMMY DATA (sementara)
============================================================ */
const dummyProfile = {
  userName: "Alex Johnson",
  userRole: "admin",
  email: "alex.johnson@neuroai.io",
  createdAt: "2024-01-12T08:20:00Z",
  lastLogin: "2025-02-15T14:32:00Z",
};

/* ============================================================
   COMPONENT
============================================================ */
const ProfileView = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* ================= BREADCRUMB ================= */}
      <BreadCrumberStyle
        navigation={[
          {
            label: "Profile",
            link: "/profile",
            icon: <IconMenus.profile fontSize="small" />,
          },
        ]}
      />

      {/* ================= PROFILE HEADER ================= */}
      <Card
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(33,150,243,0.18), rgba(13,17,23,0.9))"
              : "linear-gradient(135deg, rgba(33,150,243,0.12), #FFFFFF)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 110,
              height: 110,
              bgcolor: "primary.main",
              fontSize: 42,
              fontWeight: 700,
              boxShadow: `0 0 0 6px ${
                theme.palette.mode === "dark"
                  ? "rgba(33,150,243,0.25)"
                  : "rgba(33,150,243,0.15)"
              }`,
            }}
          >
            {dummyProfile.userName.charAt(0)}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h4" fontWeight={800}>
              {dummyProfile.userName}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" mt={1}>
              <Typography color="text.secondary" fontSize={14}>
                {dummyProfile.email}
              </Typography>
            </Stack>

            <Typography color="text.secondary" fontSize={14} mt={1.5}>
              Bergabung sejak {convertTime(dummyProfile.createdAt)}
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* ================= DETAIL INFO ================= */}
      <Card
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={3}>
          Informasi Akun
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoItem label="Username" value={dummyProfile.userName} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem label="Email" value={dummyProfile.email} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              label="Last Login"
              value={convertTime(dummyProfile.lastLogin)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              label="Account Created"
              value={convertTime(dummyProfile.createdAt)}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

/* ============================================================
   REUSABLE INFO ITEM
============================================================ */
const InfoItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography color="text.secondary" fontSize={13} mb={0.5}>
        {label}
      </Typography>
      <Typography
        fontSize={16}
        fontWeight={highlight ? 700 : 500}
        color={highlight ? "primary.main" : "text.primary"}
        textTransform={highlight ? "capitalize" : "none"}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default ProfileView;
