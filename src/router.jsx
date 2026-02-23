import DashboardPage from "./pages/DashboardPage";
import ProductPage from "./pages/ProductPage";
import VoucherPage from "./pages/VoucherPage";
import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import SalePage from "./pages/SalePage";
import ErrorPage from "./pages/ErrorPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import PredictionPage from "./pages/PredictionPage";



const rounter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: "/product",
                element: <ProductPage />,
            },
            {
                path: "/product/create",
                element: <CreateProductPage />,
            },
            {
                path: "/product/edit/:id",
                element: <EditProductPage />,
            },
            {
                path: "/voucher",
                element: <VoucherPage />,
            },            {
                path: "/voucher/:id",
                element: <VoucherPage />,
            },
            
            {
                path :"/sale",
                element: <SalePage />,
            },
            {
                path: "/ai",
                element: <PredictionPage />,
            }

        ]
    },
    
])

export default rounter;
