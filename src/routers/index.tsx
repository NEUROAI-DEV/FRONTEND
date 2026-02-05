import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ErrorPage from "../pages/error-page";
import DashboardView from "../pages/dashboard/dashboardView";
import LoginView from "../pages/auth/Login";
import ProfileView from "../pages/myProfile/Index";
import AuthLayout from "../layouts/AuthLayout";
import ListTokenScreenerView from "../pages/tokenScreener/ListTokenScreenerView";
import { useToken } from "../hooks/token";
import ListNewsView from "../pages/news/ListNewsView";

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
  ];

  const mainRouters: { path: string; element: JSX.Element }[] = [];

  const currentUser = "superAdmin";

  switch (currentUser) {
    case "superAdmin":
      mainRouters.push(
        ...[
          {
            path: "/",
            element: <DashboardView />,
          },

          {
            path: "/tokens",
            element: <ListTokenScreenerView />,
          },

           {
            path: "/news",
            element: <ListNewsView />,
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
        ]
      );
      break;
    default:
      break;
  }

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
  ]);

  return <RouterProvider router={appRouters} />;
}
