import AppRouters from './routers';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        // primary: {
        //     main: '#E0115F',
        // },
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
