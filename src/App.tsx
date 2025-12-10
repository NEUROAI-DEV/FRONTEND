import AppRouters from './routers';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
const theme = createTheme({
    palette: {
        primary: {
            main: '#EA68B4',
            contrastText: '#FFFFFF', // warna teks tombol
        },
    },

    components: {
        MuiButton: {
            defaultProps: {
                variant: 'contained',   // default semua tombol jadi contained pink
                color: 'primary',       // default semua tombol pakai primary
            },
            styleOverrides: {
                root: {
                    textTransform: 'none',     // optional: biar tidak CAPS
                    borderRadius: 12,          // optional: biar lebih lembut
                    boxShadow: '0px 3px 8px rgba(234, 104, 180, 0.35)',
                    '&:hover': {
                        backgroundColor: '#d4579f', // hover lebih gelap
                        boxShadow: '0px 4px 12px rgba(234, 104, 180, 0.45)',
                    },
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> <AppRouters />
        </ThemeProvider>
    );
}

export default App;
