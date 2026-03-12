import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ErrorPage from "../pages/error-page";
import DashboardView from "../pages/dashboard/dashboardView";
import LoginView from "../pages/auth/Login";
import RegisterView from "../pages/auth/Register";
import ProfileView from "../pages/myProfile/Index";
import ChatView from "../pages/chat/ChatView";
import AuthLayout from "../layouts/AuthLayout";
import { useToken } from "../hooks/token";
import { useHttp } from "../hooks/http";
import ListNewsView from "../pages/news/ListNewsView";
import DetailNewsView from "../pages/news/DetailNewsView";
import ListScreenerView from "../pages/screener/ListScreenerView";
import ListTrendingView from "../pages/screener/ListTrendingView";
import ListMarketTrendView from "../pages/screener/ListMarketTrendView";
import ListScreenerMarketView from "../pages/screener/ListMarketView";
import ListAcademyView from "../pages/academy/ListAcademyView";
import DetailAcademyView from "../pages/academy/DetailAcademyView";
import ListWatchListView from "../pages/watchlist/ListWatchListView";
import ListLivePredictView from "../pages/livePredict/ListLivePredictView";
import ListSmartMoneyView from "../pages/smartMoney/ListSmartMoneyView";
import ListSubscriptionPlanView from "../pages/subscription/ListSubscriptionPlanView";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { getToken } = useToken();
  const isAuth = getToken();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireActiveSubscription({ children }: { children: JSX.Element }) {
  const { handleGetRequest } = useHttp();
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkSubscription = async () => {
      try {
        const result = await handleGetRequest({ path: "/my-profiles" });
        const data = result?.data ?? result;
        const status: string | undefined =
          data?.subscription?.subscriptionStatus;

        const allowed = !!status && status !== "TRIALING";

        if (!cancelled) {
          setIsAllowed(allowed);
        }
      } catch {
        if (!cancelled) {
          setIsAllowed(false);
        }
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [handleGetRequest]);

  if (isAllowed === null) {
    return null;
  }

  if (!isAllowed) {
    return (
      <Navigate to="/subscription-plans" replace state={{ from: location.pathname }} />
    );
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
      path: "/news",
      element: <ListNewsView />,
    },
    {
      path: "/news/:newsId",
      element: <DetailNewsView />,
    },
    {
      path: "/academy",
      element: (
        <RequireAuth>
          <RequireActiveSubscription>
            <ListAcademyView />
          </RequireActiveSubscription>
        </RequireAuth>
      ),
    },
    {
      path: "/academy/:articleId",
      element: <DetailAcademyView />,
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
      path: "/live-predict",
      element: <ListLivePredictView />,
    },
    {
      path: "/smart-money",
      element: <ListSmartMoneyView />,
    },
    {
      path: "/subscription-plans",
      element: <ListSubscriptionPlanView />,
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
