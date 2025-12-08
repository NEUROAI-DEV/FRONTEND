import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ErrorPage from '../pages/error-page';
import DashboardView from '../pages/dashboard/dashboardView';
import LoginView from '../pages/auth/Login';
import ProfileView from '../pages/myProfile/Index';
import AuthLayout from '../layouts/AuthLayout';
import { useToken } from '../hooks/token';
import DetailOrderView from '../pages/orders/detailOrderView';
import ListOrderView from '../pages/orders/listOrderView';
import ListCustomersView from '../pages/customers/listCustomersView';
import DetailCustomersView from '../pages/customers/detailCustomersView';
import ListTransactionView from '../pages/transactions/listTransactionView';
import DetailTransactionView from '../pages/transactions/detailTransactionView';
import EditProfileView from '../pages/myProfile/EditProfileView';
import ListCategoryView from '../pages/categories/ListCategoryView';
import CategoryFormView from '../pages/categories/CategoryFormView';
import ProductFormView from '../pages/products/ProductFormView';
import ProductListView from '../pages/products/listProductView';
import DetailProductView from '../pages/products/detailProductView';
import ListSubCategoryView from '../pages/categories/subCategory/ListCategoryView';
import SubCategoryFormView from '../pages/categories/subCategory/CategoryFormView';
import ListUploadView from '../pages/uploads/ListUploadView';
import ListUploadHistoryView from '../pages/products/upload/ListUploadHistoryView';

export default function AppRouters() {
    const routers: { path: string; element: JSX.Element }[] = [];
    const authRouters: { path: string; element: JSX.Element }[] = [
        {
            path: '/',
            element: <LoginView />,
        },
        {
            path: '/login',
            element: <LoginView />,
        },
    ];

    const mainRouters: { path: string; element: JSX.Element }[] = [];

    const currentUser = 'superAdmin';

    switch (currentUser) {
        case 'superAdmin':
            mainRouters.push(
                ...[
                    {
                        path: '/',
                        element: <DashboardView />,
                    },
                    {
                        path: '/products',
                        element: <ProductListView />,
                    },
                    {
                        path: '/products/create',
                        element: <ProductFormView />,
                    },
                    {
                        path: '/products/edit/:productId',
                        element: <ProductFormView />,
                    },
                    {
                        path: '/products/detail/:productId',
                        element: <DetailProductView />,
                    },
                    {
                        path: '/products/uploads/histories',
                        element: <ListUploadHistoryView />,
                    },
                    // category
                    {
                        path: '/categories',
                        element: <ListCategoryView />,
                    },
                    {
                        path: '/categories/create',
                        element: <CategoryFormView />,
                    },
                    {
                        path: '/categories/edit/:categoryId',
                        element: <CategoryFormView />,
                    },

                    // uploads
                    {
                        path: '/uploads',
                        element: <ListUploadView />,
                    },

                    //subcategory
                    {
                        path: '/categories/subcategories/:categoryReference',
                        element: <ListSubCategoryView />,
                    },
                    {
                        path: '/categories/subcategories/:categoryReference/create',
                        element: <SubCategoryFormView />,
                    },
                    {
                        path: '/categories/subcategories/edit/:categoryId/:categoryReference',
                        element: <SubCategoryFormView />,
                    },
                    //customers
                    {
                        path: '/customers',
                        element: <ListCustomersView />,
                    },
                    {
                        path: '/customers/detail/:customerId',
                        element: <DetailCustomersView />,
                    },
                    {
                        path: '/orders',
                        element: <ListOrderView />,
                    },
                    {
                        path: '/orders/detail/:orderId',
                        element: <DetailOrderView />,
                    },

                    //transaction router
                    {
                        path: '/transactions',
                        element: <ListTransactionView />,
                    },
                    {
                        path: '/transactions/detail/:transactionId',
                        element: <DetailTransactionView />,
                    },
                    //my profile routers
                    {
                        path: '/my-profile',
                        element: <ProfileView />,
                    },
                    {
                        path: '/my-profile/edit/:userId',
                        element: <EditProfileView />,
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
            path: '/',
            element: isAuth ? <AppLayout /> : <AuthLayout />,
            errorElement: <ErrorPage />,
            children: routers,
        },
    ]);

    return <RouterProvider router={appRouters} />;
}
