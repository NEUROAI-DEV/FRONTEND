import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
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
import ListTrendingView from "../pages/screener/ListTrendingView";
import ListMarketTrendView from "../pages/screener/ListMarketTrendView";
import ListScreenerMarketView from "../pages/screener/ListMarketView";
import ListAcademyView from "../pages/academy/ListAcademyView";
import DetailAcademyView from "../pages/academy/DetailAcademyView";
import ListMarketView from "../pages/market/ListMarketView";
import ListWatchListView from "../pages/watchlist/ListWatchListView";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { getToken } = useToken();
  const isAuth = getToken();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouters() {
  const appChildRoutes: { path: string; element: JSX.Element }[] = [
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
      path: "/academy",
      element: <ListAcademyView />,
    },
    {
      path: "/academy/:articleId",
      element: <DetailAcademyView />,
    },
    {
      path: "/markets",
      element: <ListMarketView />,
    },
    {
      path: "/watch-list",
      element: (
        <RequireAuth>
          <ListWatchListView />
        </RequireAuth>
      ),
    },
    // {
    //   path: "/screeners",
    //   element: (
    //     <RequireAuth>
    //       <ListScreenerView />
    //     </RequireAuth>
    //   ),
    // },
    {
      path: "/screeners",
      element: <ListScreenerView />,
    },
    {
      path: "/screeners/trending",
      element: <ListTrendingView />,
    },
    {
      path: "/screeners/market-trend",
      element: <ListMarketTrendView />,
    },
    {
      path: "/screeners/market",
      element: <ListScreenerMarketView />,
    },
    {
      path: "/my-profile",
      element: (
        <RequireAuth>
          <ProfileView />
        </RequireAuth>
      ),
    },
    {
      path: "/my-profile/edit/:userId",
      element: (
        <RequireAuth>
          <ProfileView />
        </RequireAuth>
      ),
    },
  ];

  const appRouters = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: appChildRoutes,
    },
    {
      element: <AuthLayout />,
      children: [
        {
          path: "/login",
          element: <LoginView />,
        },
        {
          path: "/register",
          element: <RegisterView />,
        },
      ],
    },
    {
      path: "/chat",
      element: <ChatView />,
    },
  ]);

  return <RouterProvider router={appRouters} />;
}
