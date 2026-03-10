import React from "react";
import useSWR from "swr";
import ModuleBtn from "../components/ModuleBtn";
import Container from "../components/Container";
import { useSettings } from "../context/SettingsContext.jsx";

const DashboardPage = () => {
  const { formatCurrency, t, settings } = useSettings();
  const isDark = settings.theme === "dark";
  // Fetch products and vouchers
  const { data: products } = useSWR(import.meta.env.VITE_API_URL + '/products', (url) => fetch(url).then(res => res.json()));
  const { data: vouchers } = useSWR(import.meta.env.VITE_API_URL + '/vouchers', (url) => fetch(url).then(res => res.json()));

  const activeVouchers = Array.isArray(vouchers) ? vouchers.filter((v) => !v.deleted) : [];

  const [rangeType, setRangeType] = React.useState("today");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const toDateKey = React.useCallback((value) => {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const todayStr = toDateKey();

  const getRange = React.useCallback(() => {
    const now = new Date();
    const today = toDateKey(now);

    if (rangeType === "today") {
      return { from: today, to: today, label: t("rangeToday") };
    }

    if (rangeType === "week") {
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      const start = new Date(now);
      start.setDate(now.getDate() + diff);
      const from = toDateKey(start);
      return { from, to: today, label: t("rangeWeek") };
    }

    if (rangeType === "month") {
      const from = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
      return { from, to: today, label: t("rangeMonth") };
    }

    if (rangeType === "custom") {
      const from = customFrom || today;
      const to = customTo || today;
      return { from, to, label: t("rangeCustom") };
    }

    return { from: today, to: today, label: t("rangeToday") };
  }, [rangeType, customFrom, customTo, toDateKey, t]);

  const range = getRange();

  const filteredVouchers = React.useMemo(() => {
    if (!Array.isArray(activeVouchers)) return [];
    return activeVouchers.filter((v) => {
      if (!v?.date) return false;
      const d = toDateKey(v.date);
      return d >= range.from && d <= range.to;
    });
  }, [activeVouchers, range.from, range.to]);

  const totalSales = filteredVouchers.reduce(
    (sum, v) => sum + (v.items?.length || 0),
    0
  );
  const totalRevenue = filteredVouchers.reduce(
    (sum, v) => sum + (v.grandTotal || 0),
    0
  );
  const monthlyRevenue = activeVouchers.reduce((sum, v) => {
    const monthKey = toDateKey(v.date).slice(0, 7);
    if (monthKey && monthKey === todayStr.slice(0, 7)) {
      return sum + (v.grandTotal || 0);
    }
    return sum;
  }, 0);
  const productCount = Array.isArray(products) ? products.length : 0;
  const productProfitMap = React.useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      const id = Number(p.id);
      if (!Number.isFinite(id)) return;
      map.set(id, Number(p.standardProfit) || 0);
    });
    return map;
  }, [products]);

  const calcVoucherProfit = React.useCallback(
    (voucher) => {
      let sum = 0;
      for (const it of voucher?.items || []) {
        const qty = Number(it.quantity ?? it.qty ?? 1);
        if (!Number.isFinite(qty)) continue;
        const prod = it.product || {};
        const pid = Number(prod.id ?? it.productId ?? it.product_id);
        const perProfit = productProfitMap.get(pid) ?? 0;
        if (!Number.isFinite(perProfit)) continue;
        sum += qty * perProfit;
      }
      return sum;
    },
    [productProfitMap]
  );

  const todayProfit = activeVouchers.reduce((sum, v) => {
    if (!v?.date) return sum;
    return toDateKey(v.date) === todayStr
      ? sum + calcVoucherProfit(v)
      : sum;
  }, 0);

  const monthlyProfit = activeVouchers.reduce((sum, v) => {
    if (!v?.date) return sum;
    const monthKey = toDateKey(v.date).slice(0, 7);
    if (monthKey && monthKey === todayStr.slice(0, 7)) {
      return sum + calcVoucherProfit(v);
    }
    return sum;
  }, 0);

  const rangeProductSlices = React.useMemo(() => {
    const map = new Map();
    for (const v of filteredVouchers) {
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
  }, [filteredVouchers]);

  const rangeProfitSlices = React.useMemo(() => {
    const map = new Map();
    for (const v of filteredVouchers) {
      for (const it of v.items || []) {
        const name = it.product?.name || "Unknown";
        const qty = Number(it.quantity ?? it.qty ?? 1);
        const pid = Number(it.product?.id ?? it.productId ?? it.product_id);
        const perProfit = productProfitMap.get(pid) ?? 0;
        const amount = qty * perProfit;
        if (!Number.isFinite(amount)) continue;
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
  }, [filteredVouchers, productProfitMap]);

  const chartTypes = [
    { value: "donut", label: "Donut" },
    { value: "density", label: "Density" },
    { value: "bar", label: "Bar" },
    { value: "radar", label: "Radar" },
    { value: "line", label: "Line" },
  ];

  const profitChartTypes = [
    { value: "donut", label: "Donut" },
    { value: "density", label: "Density" },
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
  ];

  const [chartType, setChartType] = React.useState("donut");
  const [profitChartType, setProfitChartType] = React.useState("donut");

  const slicePalette = ["#F97316", "#F59E0B", "#FACC15", "#F472B6", "#FB7185", "#FB923C"];
  const profitPalette = ["#2563EB", "#0EA5E9", "#22D3EE", "#10B981", "#34D399", "#60A5FA"];

  const pieGradient = React.useMemo(() => {
    if (!rangeProductSlices.length) return "";
    let current = 0;
    const segments = rangeProductSlices.map((slice, idx) => {
      const start = current;
      const end = current + slice.percent;
      const color = slicePalette[idx % slicePalette.length];
      current = end;
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [rangeProductSlices, slicePalette]);

  const profitPieGradient = React.useMemo(() => {
    if (!rangeProfitSlices.length) return "";
    let current = 0;
    const segments = rangeProfitSlices.map((slice, idx) => {
      const start = current;
      const end = current + slice.percent;
      const color = profitPalette[idx % profitPalette.length];
      current = end;
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [rangeProfitSlices, profitPalette]);

  const getPieLabels = React.useCallback((slices, radius) => {
    let current = 0;
    return slices.map((slice) => {
      const start = current;
      const end = current + slice.percent;
      const mid = (start + end) / 2;
      current = end;
      const angle = (mid / 100) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { name: slice.name, x, y };
    });
  }, []);

  const radarSlices = React.useMemo(() => {
    return rangeProductSlices.slice(0, 6);
  }, [rangeProductSlices]);

  const profitRadarSlices = React.useMemo(() => {
    return rangeProfitSlices.slice(0, 6);
  }, [rangeProfitSlices]);

  const maxRadarValue = React.useMemo(() => {
    if (!radarSlices.length) return 1;
    return radarSlices.reduce((m, s) => (s.value > m ? s.value : m), 0) || 1;
  }, [radarSlices]);

  const maxProfitRadarValue = React.useMemo(() => {
    if (!profitRadarSlices.length) return 1;
    return profitRadarSlices.reduce((m, s) => (s.value > m ? s.value : m), 0) || 1;
  }, [profitRadarSlices]);

  return (
    <Container>
      <div className="w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {t("dashboard")}
        </h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          {t("dashboardSubtitle")}
        </p>

        {/* Card Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            {t("modules")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleBtn
              name={t("voucher")}
              icon={
                <div className={`p-4 rounded-full ${isDark ? "bg-[#24262C]" : "bg-blue-100"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" 
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-10 ${isDark ? "text-[#A3E635]" : "text-blue-600"}`}
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
                <div className={`p-4 rounded-full ${isDark ? "bg-[#24262C]" : "bg-green-100"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-10 ${isDark ? "text-[#22C55E]" : "text-green-600"}`}
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
                <div className={`p-4 rounded-full ${isDark ? "bg-[#24262C]" : "bg-purple-100"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-10 ${isDark ? "text-[#84CC16]" : "text-purple-600"}`}
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

        {/* Overview Section */}
        <div className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("overview")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={rangeType}
                onChange={(e) => setRangeType(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 accent-ring"
                style={{
                  borderColor: "var(--card-border)",
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="today">{t("rangeToday")}</option>
                <option value="week">{t("rangeWeek")}</option>
                <option value="month">{t("rangeMonth")}</option>
                <option value="custom">{t("rangeCustom")}</option>
              </select>
              {rangeType === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 accent-ring"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--card-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>{t("rangeTo")}</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 accent-ring"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--card-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}
              <span className="chip">
                {range.label}: {range.from} → {range.to}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Products */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
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
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{productCount}</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("totalProducts")}</p>
              </div>
            </div>

            {/* Today Sales */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
              <div className="p-3 bg-green-100 rounded-full text-green-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 7-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 8h6v6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{totalSales}</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("salesRangeLabel")} ({range.label})
                </p>
              </div>
            </div>

            {/* Today Revenue */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5c1.5 0 2.5-1 2.5-2.5M21 9.5c-1.5 0-2.5-1-2.5-2.5M3 14.5c1.5 0 2.5 1 2.5 2.5M21 14.5c-1.5 0-2.5 1-2.5 2.5" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Math.round(totalRevenue))}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("revenueRangeLabel")} ({range.label})
                </p>
              </div>
            </div>


            {/* Monthly Revenue */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
              <div className="p-3 bg-red-100 rounded-full text-red-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M3 9h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Math.round(monthlyRevenue))}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("monthlyRevenue")}</p>
              </div>
            </div>

            {/* Today Profit */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Math.round(todayProfit))}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("todayProfit")}</p>
              </div>
            </div>

            {/* Monthly Profit */}
            <div className="card flex items-center p-4 transition hover:shadow-lg">
              <div className="p-3 bg-amber-100 rounded-full text-amber-700 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m6-9H6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Math.round(monthlyProfit))}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("monthlyProfit")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t("todayProductShare")}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("todayProductShareDesc")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: "var(--text-secondary)" }} htmlFor="chartType">
                  {t("chartType")}
                </label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 accent-ring"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                {profitChartTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            </div>

            {rangeProductSlices.length === 0 ? (
              <div className={`text-sm italic mt-4 ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
                {t("noSalesInRange")}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-4">
                {chartType === "bar" && (
                  <div className="w-full space-y-3">
                    {rangeProductSlices.map((slice, idx) => {
                      const color = slicePalette[idx % slicePalette.length];
                      return (
                        <div key={slice.name} className="group space-y-1">
                          <div className={`flex items-center justify-between text-xs opacity-0 transition group-hover:opacity-100 ${isDark ? "text-[#A1A1AA]" : "text-gray-600"}`}>
                            <span className="truncate max-w-[220px]">{slice.name}</span>
                            <span>{slice.percent.toFixed(1)}%</span>
                          </div>
                          <div className={`h-2 w-full rounded-full ${isDark ? "bg-[#24262C]" : "bg-gray-100"}`}>
                            <div
                              className="h-2 rounded-full"
                              title={slice.name}
                              style={{ width: `${slice.percent}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {chartType === "donut" && (
                  <div className="group relative w-40 h-40">
                    <div
                      className="w-40 h-40 rounded-full shadow-inner"
                      style={{
                        backgroundImage: pieGradient,
                      }}
                    />
                    {chartType === "donut" && (
                      <div className={`absolute inset-0 m-6 rounded-full shadow-inner ${isDark ? "bg-[#1E1F23]" : "bg-white"}`} />
                    )}
                    <div className="absolute inset-0">
                      {getPieLabels(rangeProductSlices, 60).map((label) => (
                        <span
                          key={label.name}
                          className={`absolute text-[10px] opacity-0 transition group-hover:opacity-100 ${isDark ? "text-[#E5E7EB]" : "text-gray-700"}`}
                          style={{
                            left: "50%",
                            top: "50%",
                            transform: `translate(${label.x}px, ${label.y}px) translate(-50%, -50%)`,
                            maxWidth: "70px",
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {chartType === "density" && (
                  <div className="group w-full flex justify-center">
                    <svg width="260" height="200" viewBox="0 0 260 200">
                      <g transform="translate(20 20)">
                        <rect
                          x="0"
                          y="0"
                          width="220"
                          height="160"
                          fill="none"
                          stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                          strokeWidth="1"
                        />
                        {radarSlices.length > 1 && (
                          <path
                            d={[
                              "M",
                              ...radarSlices.map((slice, idx) => {
                                const x = (220 / (radarSlices.length - 1)) * idx;
                                const y = 160 - (slice.value / maxRadarValue) * 140;
                                return `${x} ${y}`;
                              }),
                              "L",
                              220,
                              160,
                              "L",
                              0,
                              160,
                              "Z",
                            ].join(" ")}
                            fill={isDark ? "rgba(249, 115, 22, 0.25)" : "rgba(249, 115, 22, 0.2)"}
                            stroke={slicePalette[0]}
                            strokeWidth="2"
                          />
                        )}
                        {radarSlices.map((slice, idx) => {
                          const x = (220 / Math.max(1, radarSlices.length - 1)) * idx;
                          const y = 160 - (slice.value / maxRadarValue) * 140;
                          const pointColor = slicePalette[idx % slicePalette.length];
                          return (
                            <g key={slice.name}>
                              <circle cx={x} cy={y} r="3" fill={pointColor}>
                                <title>{slice.name}</title>
                              </circle>
                              <text
                                x={x + 4}
                                y={y - 6}
                                fontSize="9"
                                className="opacity-0 transition group-hover:opacity-100"
                                fill={isDark ? "#E5E7EB" : "#4B5563"}
                              >
                                {slice.name}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                )}

                {chartType === "radar" && (
                  <div className="group w-full flex justify-center">
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
                              stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                              strokeWidth="1"
                            />
                          );
                        })}
                        {radarSlices.map((slice, idx) => {
                          const angle = (Math.PI * 2 * idx) / radarSlices.length - Math.PI / 2;
                          const x = 80 * Math.cos(angle);
                          const y = 80 * Math.sin(angle);
                          const pointColor = slicePalette[idx % slicePalette.length];
                          return (
                            <g key={slice.name}>
                              <line
                                x1="0"
                                y1="0"
                                x2={x}
                                y2={y}
                                stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                                strokeWidth="1"
                              />
                              <circle cx={x} cy={y} r="3" fill={pointColor}>
                                <title>{slice.name}</title>
                              </circle>
                              <text
                                x={x * 1.12}
                                y={y * 1.12}
                                fontSize="9"
                                textAnchor={x > 0.1 ? "start" : x < -0.1 ? "end" : "middle"}
                                dominantBaseline={y > 0.1 ? "hanging" : y < -0.1 ? "baseline" : "middle"}
                                className="opacity-0 transition group-hover:opacity-100"
                                fill={isDark ? "#E5E7EB" : "#4B5563"}
                              >
                                {slice.name}
                              </text>
                            </g>
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
                          fill="rgba(34, 197, 94, 0.25)"
                          stroke="#22C55E"
                          strokeWidth="2"
                        />
                      </g>
                    </svg>
                  </div>
                )}

                {chartType === "line" && (
                  <div className="group w-full flex justify-center">
                    <svg width="260" height="200" viewBox="0 0 260 200">
                      <g transform="translate(20 20)">
                        <rect
                          x="0"
                          y="0"
                          width="220"
                          height="160"
                          fill="none"
                          stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                          strokeWidth="1"
                        />
                        {radarSlices.length > 1 && (
                          <polyline
                            fill="none"
                            stroke={slicePalette[0]}
                            strokeWidth="2"
                            points={radarSlices
                              .map((slice, idx) => {
                                const x = (220 / (radarSlices.length - 1)) * idx;
                                const y = 160 - (slice.value / maxRadarValue) * 140;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}
                        {radarSlices.map((slice, idx) => {
                          const x = (220 / Math.max(1, radarSlices.length - 1)) * idx;
                          const y = 160 - (slice.value / maxRadarValue) * 140;
                          const pointColor = slicePalette[idx % slicePalette.length];
                          return (
                            <g key={slice.name}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill={pointColor}
                              >
                                <title>{slice.name}</title>
                              </circle>
                              <text
                                x={x + 4}
                                y={y - 6}
                                fontSize="9"
                                className="opacity-0 transition group-hover:opacity-100"
                                fill={isDark ? "#E5E7EB" : "#4B5563"}
                              >
                                {slice.name}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                )}

                <div className="w-full space-y-2 text-xs">
                  {rangeProductSlices.map((slice, idx) => {
                    const color = slicePalette[idx % slicePalette.length];
                    return (
                      <div key={slice.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className={`truncate max-w-[160px] ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
                            {slice.name}
                          </span>
                        </div>
                        <div className={`${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
                          {slice.percent.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t("profitShare")}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("profitShareDesc")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: "var(--text-secondary)" }} htmlFor="profitChartType">
                  {t("chartType")}
                </label>
                <select
                  id="profitChartType"
                  value={profitChartType}
                  onChange={(event) => setProfitChartType(event.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 accent-ring"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                {profitChartTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
                </select>
              </div>
            </div>

            {rangeProfitSlices.length === 0 ? (
              <div className={`text-sm italic mt-4 ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
                {t("noSalesInRange")}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-4">
                {profitChartType === "bar" && (
                  <div className="w-full space-y-3">
                    {rangeProfitSlices.map((slice, idx) => {
                      const color = profitPalette[idx % profitPalette.length];
                      return (
                        <div key={slice.name} className="group space-y-1">
                          <div className={`flex items-center justify-between text-xs opacity-0 transition group-hover:opacity-100 ${isDark ? "text-[#A1A1AA]" : "text-gray-600"}`}>
                            <span className="truncate max-w-[220px]">{slice.name}</span>
                            <span>{slice.percent.toFixed(1)}%</span>
                          </div>
                          <div className={`h-2 w-full rounded-full ${isDark ? "bg-[#24262C]" : "bg-gray-100"}`}>
                            <div
                              className="h-2 rounded-full"
                              title={slice.name}
                              style={{ width: `${slice.percent}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {profitChartType === "donut" && (
                  <div className="group relative w-40 h-40">
                    <div
                      className="w-40 h-40 rounded-full shadow-inner"
                      style={{
                        backgroundImage: profitPieGradient,
                      }}
                    />
                    {profitChartType === "donut" && (
                      <div className={`absolute inset-0 m-6 rounded-full shadow-inner ${isDark ? "bg-[#1E1F23]" : "bg-white"}`} />
                    )}
                    <div className="absolute inset-0">
                      {getPieLabels(rangeProfitSlices, 60).map((label) => (
                        <span
                          key={label.name}
                          className={`absolute text-[10px] opacity-0 transition group-hover:opacity-100 ${isDark ? "text-[#E5E7EB]" : "text-gray-700"}`}
                          style={{
                            left: "50%",
                            top: "50%",
                            transform: `translate(${label.x}px, ${label.y}px) translate(-50%, -50%)`,
                            maxWidth: "70px",
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profitChartType === "density" && (
                  <div className="group w-full flex justify-center">
                    <svg width="260" height="200" viewBox="0 0 260 200">
                      <g transform="translate(20 20)">
                        <rect
                          x="0"
                          y="0"
                          width="220"
                          height="160"
                          fill="none"
                          stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                          strokeWidth="1"
                        />
                        {profitRadarSlices.length > 1 && (
                          <path
                            d={[
                              "M",
                              ...profitRadarSlices.map((slice, idx) => {
                                const x = (220 / (profitRadarSlices.length - 1)) * idx;
                                const y = 160 - (slice.value / maxProfitRadarValue) * 140;
                                return `${x} ${y}`;
                              }),
                              "L",
                              220,
                              160,
                              "L",
                              0,
                              160,
                              "Z",
                            ].join(" ")}
                            fill={isDark ? "rgba(37, 99, 235, 0.25)" : "rgba(37, 99, 235, 0.2)"}
                            stroke={profitPalette[0]}
                            strokeWidth="2"
                          />
                        )}
                        {profitRadarSlices.map((slice, idx) => {
                          const x = (220 / Math.max(1, profitRadarSlices.length - 1)) * idx;
                          const y = 160 - (slice.value / maxProfitRadarValue) * 140;
                          const pointColor = profitPalette[idx % profitPalette.length];
                          return (
                            <g key={slice.name}>
                              <circle cx={x} cy={y} r="3" fill={pointColor}>
                                <title>{slice.name}</title>
                              </circle>
                              <text
                                x={x + 4}
                                y={y - 6}
                                fontSize="9"
                                className="opacity-0 transition group-hover:opacity-100"
                                fill={isDark ? "#E5E7EB" : "#4B5563"}
                              >
                                {slice.name}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                )}

                {profitChartType === "line" && (
                  <div className="group w-full flex justify-center">
                    <svg width="260" height="200" viewBox="0 0 260 200">
                      <g transform="translate(20 20)">
                        <rect
                          x="0"
                          y="0"
                          width="220"
                          height="160"
                          fill="none"
                          stroke={isDark ? "#3F3F46" : "#e5e7eb"}
                          strokeWidth="1"
                        />
                        {profitRadarSlices.length > 1 && (
                          <polyline
                            fill="none"
                            stroke={profitPalette[0]}
                            strokeWidth="2"
                            points={profitRadarSlices
                              .map((slice, idx) => {
                                const x = (220 / (profitRadarSlices.length - 1)) * idx;
                                const y = 160 - (slice.value / maxProfitRadarValue) * 140;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}
                        {profitRadarSlices.map((slice, idx) => {
                          const x = (220 / Math.max(1, profitRadarSlices.length - 1)) * idx;
                          const y = 160 - (slice.value / maxProfitRadarValue) * 140;
                          const pointColor = profitPalette[idx % profitPalette.length];
                          return (
                            <g key={slice.name}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill={pointColor}
                              >
                                <title>{slice.name}</title>
                              </circle>
                              <text
                                x={x + 4}
                                y={y - 6}
                                fontSize="9"
                                className="opacity-0 transition group-hover:opacity-100"
                                fill={isDark ? "#E5E7EB" : "#4B5563"}
                              >
                                {slice.name}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                )}

                <div className="w-full space-y-2 text-xs">
                  {rangeProfitSlices.map((slice, idx) => {
                    const color = profitPalette[idx % profitPalette.length];
                    return (
                      <div key={slice.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className={`truncate max-w-[160px] ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
                            {slice.name}
                          </span>
                        </div>
                        <div className={`${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
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
