/* eslint-disable react-hooks/exhaustive-deps */
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import {
    Box,
    Drawer as MuiDrawer,
    AppBar as MuiAppBar,
    AppBarProps as MuiAppBarProps,
    Toolbar,
    List,
    CssBaseline,
    Typography,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Container,
    Tooltip,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert,
    AlertTitle,
    Stack,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blue, grey } from '@mui/material/colors';
import { useAppContext } from '../context/app.context';
import { useToken } from '../hooks/token';
import { IconMenus } from '../components/icon';
import logo from '../assets/logo.webp';

const drawerWidth = 240;

/* === Drawer animation & styles === */
const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    backdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.7)',
    color: grey[800],
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.standard,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,

    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': {
            ...openedMixin(theme),
            background: `linear-gradient(180deg, ${blue[700]} 0%, ${blue[600]} 100%)`,
            color: '#fff',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        },
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': {
            ...closedMixin(theme),
            background: `linear-gradient(180deg, ${blue[700]} 0%, ${blue[600]} 100%)`,
            color: '#fff',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
        },
    }),
}));

export default function AppLayout() {
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = useState(true);
    const { appAlert, setAppAlert, isLoading, setIsLoading } = useAppContext();
    const { removeToken } = useToken();
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [activeLink, setActiveLink] = useState('/');

    const menuItems = [
        { title: 'Dashboard', link: '/', icon: <IconMenus.dashboard /> },
        { title: 'Products', link: '/products', icon: <IconMenus.products /> },
        { title: 'Category', link: '/categories', icon: <IconMenus.category /> },
        { title: 'Uploads', link: '/uploads', icon: <IconMenus.upload /> },
        { title: 'Customers', link: '/customers', icon: <IconMenus.customers /> },
        { title: 'Orders', link: '/orders', icon: <IconMenus.orders /> },
        { title: 'Transactions', link: '/transactions', icon: <IconMenus.transaction /> },
        { title: 'Profile', link: '/my-profile', icon: <IconMenus.profile /> },
    ];

    const handleDrawer = () => setOpenDrawer(!openDrawer);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) =>
        setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    useEffect(() => {
        const savedLink = localStorage.getItem('activeSidebarLink');
        if (savedLink) setActiveLink(savedLink);
    }, []);

    return (
        <Box sx={{ display: 'flex', bgcolor: grey[50], minHeight: '100vh' }}>
            <CssBaseline />

            {/* === APP BAR === */}
            <AppBar position="fixed" open={openDrawer}>
                <Container maxWidth="xl">
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: 64,
                        }}
                    >
                        {/* LOGO + TITLE */}
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: openDrawer ? 0 : 5 }}>
                            <img src={logo} width={40} height={40} style={{ borderRadius: 8 }} />
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    ml: 1.5,
                                    fontWeight: 700,
                                    letterSpacing: '.1rem',
                                    color: blue[800],
                                }}
                            >
                                LEORA
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        {/* USER MENU */}
                        <Tooltip title="Account settings">
                            <IconButton onClick={handleOpenUserMenu}>
                                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>

                        <Menu
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleCloseUserMenu();
                                    navigate('/my-profile');
                                }}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleCloseUserMenu();
                                    removeToken();
                                    navigate('/');
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* === SIDEBAR === */}
            <Drawer variant="permanent" open={openDrawer}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawer} sx={{ color: 'white' }}>
                        {theme.direction === 'rtl' || openDrawer ? (
                            <ChevronLeft />
                        ) : (
                            <ChevronRight />
                        )}
                    </IconButton>
                </DrawerHeader>

                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.link}
                            disablePadding
                            sx={{
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                backgroundColor:
                                    activeLink === item.link
                                        ? 'rgba(255,255,255,0.15)'
                                        : 'transparent',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                    transform: 'translateX(4px)',
                                },
                            }}
                            onClick={() => {
                                setActiveLink(item.link);
                                localStorage.setItem('activeSidebarLink', item.link);
                            }}
                        >
                            <Link
                                to={item.link}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <ListItemButton
                                    sx={{
                                        minHeight: 46,
                                        justifyContent: openDrawer ? 'initial' : 'center',
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: openDrawer ? 2.5 : 'auto',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            opacity: activeLink === item.link ? 1 : 0.8,
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        sx={{
                                            opacity: openDrawer ? 1 : 0,
                                            fontWeight: activeLink === item.link ? 600 : 400,
                                        }}
                                    />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* === MAIN CONTENT === */}
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <DrawerHeader />
                {isLoading ? (
                    <Backdrop
                        sx={{
                            color: '#fff',
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }}
                        open={isLoading}
                        onClick={() => setIsLoading(false)}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : (
                    <Outlet />
                )}
                <Stack direction="row" justifyContent="flex-end">
                    <Snackbar
                        open={appAlert.isDisplayAlert}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        autoHideDuration={4000}
                        onClose={() =>
                            setAppAlert({
                                isDisplayAlert: false,
                                message: '',
                                alertType: undefined,
                            })
                        }
                    >
                        <Alert severity={appAlert.alertType}>
                            <AlertTitle>{appAlert.alertType?.toUpperCase()}</AlertTitle>
                            {appAlert.message}
                        </Alert>
                    </Snackbar>
                </Stack>
            </Box>
        </Box>
    );
}
