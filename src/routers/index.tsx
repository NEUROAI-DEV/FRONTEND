import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ErrorPage from "../pages/error-page";
import DashboardView from "../pages/dashboard/dashboardView";
import LoginView from "../pages/auth/Login";
import RegisterView from "../pages/auth/Register";
import ProfileView from "../pages/myProfile/Index";
import ChatView from "../pages/chat/ChatView";
import AuthLayout from "../layouts/AuthLayout";
import { useToken } from "../hooks/token";
import ListNewsView from "../pages/news/ListNewsView";
import DetailNewsView from "../pages/news/DetailNewsView";
import ListTopSignalsView from "../pages/topSignal/ListTopSignalView";
import ListScreenerView from "../pages/screener/ListScreenerView";
import ListAcademyView from "../pages/academy/ListAcademyView";
import ListMarketView from "../pages/market/ListMarketView";

export default function AppRouters() {
  const routers: { path: string; element: JSX.Element }[] = [];
  const authRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <LoginView />,
    },
    {
      path: "/login",
      element: <LoginView />,
    },
    {
      path: "/register",
      element: <RegisterView />,
    },
  ];

  const mainRouters: { path: string; element: JSX.Element }[] = [
    {
      path: "/",
      element: <DashboardView />,
    },

    {
      path: "/top-signals",
      element: <ListTopSignalsView />,
    },

    {
      path: "/news",
      element: <ListNewsView />,
    },
    {
      path: "/news/:newsId",
      element: <DetailNewsView />,
    },
    {
      path: "/screeners",
      element: <ListScreenerView />,
    },
    {
      path: "/academy",
      element: <ListAcademyView />,
    },
    {
      path: "/markets",
      element: <ListMarketView />,
    },

    //my profile routers
    {
      path: "/my-profile",
      element: <ProfileView />,
    },
    {
      path: "/my-profile/edit/:userId",
      element: <ProfileView />,
    },
  ];

  const { getToken } = useToken();

  const isAuth = getToken();

  if (isAuth) {
    routers.push(...mainRouters);
  } else {
    routers.push(...authRouters);
  }

  const appRouters = createBrowserRouter([
    {
      path: "/",
      element: isAuth ? <AppLayout /> : <AuthLayout />,
      errorElement: <ErrorPage />,
      children: routers,
    },
    {
      path: "/chat",
      element: <ChatView />,
    },
  ]);

  return <RouterProvider router={appRouters} />;
}
