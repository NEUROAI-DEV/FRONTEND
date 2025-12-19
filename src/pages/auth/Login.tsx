import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Container,
  Box,
  TextField,
  Divider,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import { useToken } from "../../hooks/token";
import { IUserLoginRequestModel } from "../../models/userModel";

export default function LoginView() {
  const { handlePostRequest } = useHttp();
  const { setToken } = useToken();
  const navigate = useNavigate();

  const [userWhatsAppNumber, setUserWhatsAppNumber] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const payload: IUserLoginRequestModel = {
        userWhatsAppNumber,
        userPassword,
      };

      const result = await handlePostRequest({
        path: "/admins/login",
        body: payload,
      });

      if (result) {
        setToken(result.data.token);
        window.location.reload();
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginWithGoogle = () => {
    console.log("Login with Google (dummy)");
    // nanti arahkan ke OAuth Google
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <Stack spacing={1} mb={3} textAlign="center">
          <Typography variant="h4" fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Login untuk melanjutkan ke dashboard
          </Typography>
        </Stack>

        {/* Form */}
        <Stack spacing={2}>
          <TextField
            label="WhatsApp Number"
            value={userWhatsAppNumber}
            size="medium"
            fullWidth
            onChange={(e) => setUserWhatsAppNumber(e.target.value)}
          />

          <TextField
            label="Password"
            value={userPassword}
            size="medium"
            type="password"
            fullWidth
            onChange={(e) => setUserPassword(e.target.value)}
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            sx={{
              mt: 1,
              fontWeight: "bold",
              borderRadius: 2,
              py: 1.2,
            }}
            onClick={handleSubmit}
          >
            Login
          </Button>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Google Login */}
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
          }}
          onClick={handleLoginWithGoogle}
        >
          Login with Google
        </Button>
      </Card>
    </Container>
  );
}
