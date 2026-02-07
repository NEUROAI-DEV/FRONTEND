import { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useHttp } from "../../hooks/http";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export function ChatWidget() {
  const { handlePostRequest } = useHttp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await handlePostRequest({
        path: "/chat",
        body: {
          message: trimmed,
        },
      });

      const replyText =
        (res &&
          (res.data?.reply || res.data?.message || res.data?.content)) ??
        "Terima kasih, pesan Anda sudah diterima.";

      const botMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: String(replyText),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!open) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, open]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: (theme) => theme.zIndex.tooltip + 10,
      }}
    >
      {open && (
        <Paper
          elevation={6}
          sx={{
            mb: 1.5,
            width: { xs: 320, sm: 360, md: 400 },
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "primary.main",
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Chat Support
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tanyakan apa pun tentang Neuro AI
                </Typography>
              </Box>
            </Stack>

            <IconButton size="small" onClick={handleToggle}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider />

          <Box
            sx={{
              flexGrow: 1,
              px: 2,
              py: 1.5,
              overflowY: "auto",
              backgroundColor: "background.default",
            }}
          >
            {messages.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 4 }}
              >
                Mulai percakapan dengan mengirim pesan pertama Anda.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <Stack
                      key={msg.id}
                      direction="row"
                      justifyContent={isUser ? "flex-end" : "flex-start"}
                    >
                      <Box
                        sx={{
                          maxWidth: "80%",
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: isUser
                            ? "primary.main"
                            : "rgba(148, 163, 184, 0.18)",
                          color: isUser ? "primary.contrastText" : "text.primary",
                          fontSize: 13,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </Box>
                    </Stack>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>

          <Divider />

          <Box sx={{ px: 1.5, py: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                placeholder="Ketik pesan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                {sending ? (
                  <CircularProgress size={20} />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}

      <Tooltip title={open ? "Tutup chat" : "Buka chat"}>
        <IconButton
          color="primary"
          onClick={handleToggle}
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            boxShadow: 6,
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          <ChatBubbleOutlineIcon sx={{ color: "primary.contrastText" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

