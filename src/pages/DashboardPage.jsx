import React from "react";
import ModuleBtn from "../components/ModuleBtn";
import Container from "../components/Container";

const DashboardPage = () => {
  return (
    <Container>
      <div className="w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Choose a module to get started managing your system.
        </p>

        {/* Card Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Modules</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModuleBtn
              name="Voucher"
              icon={
                <div className="bg-blue-100 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
                    />
                  </svg>
                </div>
              }
              url="/voucher"
            />

            <ModuleBtn
              name="Sale"
              icon={
                <div className="bg-green-100 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                </div>
              }
              url="/sale"
            />

            <ModuleBtn
              name="Product"
              icon={
                <div className="bg-purple-100 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 text-purple-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75"
                    />
                  </svg>
                </div>
              }
              url="/product"
            />
          </div>
        </div>

        {/* Today Overview Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Today Overview</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center shadow-sm border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">120</p>
              <p className="text-gray-600 text-sm">Products</p>
            </div>

            <div className="bg-green-50 p-4 rounded-xl text-center shadow-sm border border-green-100">
              <p className="text-2xl font-bold text-green-700">32</p>
              <p className="text-gray-600 text-sm">Sales Today</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl text-center shadow-sm border border-purple-100">
              <p className="text-2xl font-bold text-purple-700">58</p>
              <p className="text-gray-600 text-sm">Vouchers</p>
            </div>

            <div className="bg-red-50 p-4 rounded-xl text-center shadow-sm border border-red-100">
              <p className="text-2xl font-bold text-red-700">4</p>
              <p className="text-gray-600 text-sm">Low Stock</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DashboardPage;
