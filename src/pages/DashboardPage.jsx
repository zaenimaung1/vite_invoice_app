import React from "react";
import useSWR from "swr";
import ModuleBtn from "../components/ModuleBtn";
import Container from "../components/Container";
import { useSettings } from "../context/SettingsContext.jsx";

const DashboardPage = () => {
  const { formatCurrency, t } = useSettings();
  // Fetch products and vouchers
  const { data: products } = useSWR(import.meta.env.VITE_API_URL + '/products', (url) => fetch(url).then(res => res.json()));
  const { data: vouchers } = useSWR(import.meta.env.VITE_API_URL + '/vouchers', (url) => fetch(url).then(res => res.json()));

  const activeVouchers = Array.isArray(vouchers) ? vouchers.filter((v) => !v.deleted) : [];

  // Compute today's overview
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVouchers = activeVouchers
    ? activeVouchers.filter(v => v.date && v.date.slice(0, 10) === todayStr)
    : [];
  const todaySales = todayVouchers.reduce((sum, v) => sum + (v.items?.length || 0), 0);
  const todayRevenue = todayVouchers.reduce((sum, v) => sum + (v.grandTotal || 0), 0);
  const monthlyRevenue = activeVouchers.reduce((sum, v) => {
    if (v.date && v.date.slice(0, 7) === todayStr.slice(0, 7)) {
      return sum + (v.grandTotal || 0);
    }
    return sum;
  }, 0);
  const productCount = Array.isArray(products) ? products.length : 0;

  const todayProductSlices = React.useMemo(() => {
    const map = new Map();
    for (const v of todayVouchers) {
      for (const it of v.items || []) {
        const name = it.product?.name || "Unknown";
        const amount = Number(it.cost || 0);
        map.set(name, (map.get(name) || 0) + amount);
      }
    }
    const entries = Array.from(map.entries());
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (!total) return [];

    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percent: (value / total) * 100,
      }));
  }, [todayVouchers]);

  const chartTypes = [
    { value: "donut", label: "Donut" },
    { value: "pie", label: "Pie" },
    { value: "bar", label: "Bar" },
    { value: "radar", label: "Radar" },
  ];

  const [chartType, setChartType] = React.useState("donut");

  const slicePalette = ["#4f46e5", "#22c55e", "#f97316", "#e11d48", "#0ea5e9", "#a855f7"];

  const pieGradient = React.useMemo(() => {
    if (!todayProductSlices.length) return "";
    let current = 0;
    const segments = todayProductSlices.map((slice, idx) => {
      const start = current;
      const end = current + slice.percent;
      const color = slicePalette[idx % slicePalette.length];
      current = end;
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [todayProductSlices, slicePalette]);

  const radarSlices = React.useMemo(() => {
    return todayProductSlices.slice(0, 6);
  }, [todayProductSlices]);

  const maxRadarValue = React.useMemo(() => {
    if (!radarSlices.length) return 1;
    return radarSlices.reduce((m, s) => (s.value > m ? s.value : m), 0) || 1;
  }, [radarSlices]);

  return (
    <Container>
      <div className="w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("dashboard")}</h1>
        <p className="text-gray-500 mb-6">
          {t("dashboardSubtitle")}
        </p>

        {/* Card Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{t("modules")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleBtn
              name={t("voucher")}
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
              name={t("sale")}
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
              name={t("product")}
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">{t("overview")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Products */}
            <div className="flex items-center p-4 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 transition">
              <div className="p-3 bg-blue-100 rounded-full text-blue-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{productCount}</p>
                <p className="text-gray-500 text-sm">{t("totalProducts")}</p>
              </div>
            </div>

            {/* Today Sales */}
            <div className="flex items-center p-4 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 transition">
              <div className="p-3 bg-green-100 rounded-full text-green-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 7-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 8h6v6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{todaySales}</p>
                <p className="text-gray-500 text-sm">{t("todaySales")}</p>
              </div>
            </div>

            {/* Today Revenue */}
            <div className="flex items-center p-4 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 transition">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5c1.5 0 2.5-1 2.5-2.5M21 9.5c-1.5 0-2.5-1-2.5-2.5M3 14.5c1.5 0 2.5 1 2.5 2.5M21 14.5c-1.5 0-2.5 1-2.5 2.5" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(Math.round(todayRevenue))}
                </p>
                <p className="text-gray-500 text-sm">{t("todayRevenue")}</p>
              </div>
            </div>


            {/* Monthly Revenue */}
            <div className="flex items-center p-4 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 transition">
              <div className="p-3 bg-red-100 rounded-full text-red-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M3 9h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(Math.round(monthlyRevenue))}
                </p>
                <p className="text-gray-500 text-sm">{t("monthlyRevenue")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-10">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">{t("todayProductShare")}</h2>
                <p className="text-gray-500 text-sm">{t("todayProductShareDesc")}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500" htmlFor="chartType">
                  {t("chartType")}
                </label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {chartTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {todayProductSlices.length === 0 ? (
              <div className="text-sm text-gray-500 italic mt-4">{t("noSalesToday")}</div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-4">
                {chartType === "bar" && (
                  <div className="w-full space-y-3">
                    {todayProductSlices.map((slice, idx) => {
                      const color = slicePalette[idx % slicePalette.length];
                      return (
                        <div key={slice.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="truncate max-w-[220px]">{slice.name}</span>
                            <span>{slice.percent.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${slice.percent}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(chartType === "pie" || chartType === "donut") && (
                  <div className="relative w-40 h-40">
                    <div
                      className="w-40 h-40 rounded-full shadow-inner"
                      style={{
                        backgroundImage: pieGradient,
                      }}
                    />
                    {chartType === "donut" && (
                      <div className="absolute inset-0 m-6 rounded-full bg-white shadow-inner" />
                    )}
                  </div>
                )}

                {chartType === "radar" && (
                  <div className="w-full flex justify-center">
                    <svg width="220" height="220" viewBox="0 0 220 220">
                      <g transform="translate(110 110)">
                        {[0.33, 0.66, 1].map((scale) => {
                          const points = radarSlices
                            .map((_, idx) => {
                              const angle = (Math.PI * 2 * idx) / radarSlices.length - Math.PI / 2;
                              const r = 80 * scale;
                              const x = r * Math.cos(angle);
                              const y = r * Math.sin(angle);
                              return `${x},${y}`;
                            })
                            .join(" ");
                          return (
                            <polygon
                              key={scale}
                              points={points}
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          );
                        })}
                        {radarSlices.map((_, idx) => {
                          const angle = (Math.PI * 2 * idx) / radarSlices.length - Math.PI / 2;
                          const x = 80 * Math.cos(angle);
                          const y = 80 * Math.sin(angle);
                          return (
                            <line
                              key={idx}
                              x1="0"
                              y1="0"
                              x2={x}
                              y2={y}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          );
                        })}
                        <polygon
                          points={radarSlices
                            .map((slice, idx) => {
                              const angle = (Math.PI * 2 * idx) / radarSlices.length - Math.PI / 2;
                              const r = (slice.value / maxRadarValue) * 80;
                              const x = r * Math.cos(angle);
                              const y = r * Math.sin(angle);
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="rgba(79, 70, 229, 0.25)"
                          stroke="#4f46e5"
                          strokeWidth="2"
                        />
                      </g>
                    </svg>
                  </div>
                )}

                <div className="w-full space-y-2 text-xs">
                  {todayProductSlices.map((slice, idx) => {
                    const color = slicePalette[idx % slicePalette.length];
                    return (
                      <div key={slice.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-gray-700 truncate max-w-[160px]">
                            {slice.name}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {slice.percent.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </Container>
  );
};

export default DashboardPage;
