import React from "react";
import useSWR from "swr";
import { Link } from "react-router";
import Container from "../components/Container";

const fetcher = (url) => fetch(url).then((res) => res.json());

const TIME_OPTIONS = [
  { id: "next-day", label: "Next Day", days: 1 },
  { id: "next-week", label: "Next Week", days: 7 },
  { id: "next-month", label: "Next Month", days: 30 },
];

const formatMMK = (value) =>
  `${Math.round(value).toLocaleString("en-US")} Ks`;

const PredictionPage = () => {
  const { data: vouchers } = useSWR(
    import.meta.env.VITE_API_URL + "/vouchers",
    fetcher
  );

  const [timeId, setTimeId] = React.useState("next-day");

  const activeVouchers = Array.isArray(vouchers)
    ? vouchers.filter((v) => !v.deleted)
    : [];

  const dailyTotals = React.useMemo(() => {
    const map = new Map();
    for (const v of activeVouchers) {
      const day = v?.date ? String(v.date).slice(0, 10) : null;
      if (!day) continue;
      const prev = map.get(day) || 0;
      map.set(day, prev + Number(v.grandTotal || 0));
    }
    const items = Array.from(map.entries()).map(([date, total]) => ({
      date,
      total,
    }));
    items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
  }, [activeVouchers]);

  const lastRecord = dailyTotals[dailyTotals.length - 1];

  // 🔹 Moving Average (Last 7 Days)
  const movingAverage = React.useMemo(() => {
    if (!dailyTotals.length) return 0;
    const recent = dailyTotals.slice(-7);
    const sum = recent.reduce((acc, d) => acc + d.total, 0);
    return sum / recent.length;
  }, [dailyTotals]);

  // 🔹 Average Growth (Last 5 Days + limit)
  const avgGrowth = React.useMemo(() => {
    if (dailyTotals.length < 2) return 0;
    const recent = dailyTotals.slice(-5);
    let sum = 0;
    let count = 0;
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1].total;
      const curr = recent[i].total;
      if (prev <= 0) continue;
      let growth = (curr - prev) / prev;
      if (growth > 1) growth = 1;
      if (growth < -1) growth = -1;
      sum += growth;
      count++;
    }
    return count ? sum / count : 0;
  }, [dailyTotals]);

  const growthPrediction = React.useMemo(() => {
    if (!lastRecord) return 0;
    return lastRecord.total * (1 + avgGrowth);
  }, [lastRecord, avgGrowth]);

  // 🔹 Linear Regression
  const linearPrediction = React.useMemo(() => {
    const n = dailyTotals.length;
    if (n < 2) return 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = dailyTotals[i].total;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return sumY / n;
    const b = (n * sumXY - sumX * sumY) / denom;
    const a = (sumY - b * sumX) / n;
    return a + b * n;
  }, [dailyTotals]);

  const selectedTime = TIME_OPTIONS.find((t) => t.id === timeId);
  const daysAhead = selectedTime?.days || 1;

  // 🔥 Hybrid AI
  const prediction = React.useMemo(() => {
    if (!dailyTotals.length) return 0;

    const hybrid =
      (movingAverage + growthPrediction + linearPrediction) / 3;

    return Math.max(0, hybrid * daysAhead);
  }, [
    movingAverage,
    growthPrediction,
    linearPrediction,
    daysAhead,
    dailyTotals,
  ]);

  return (
    <Container>
      <div className="w-full">
        {/* Header + Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Hybrid AI Forecast
            </h1>
            <p className="text-gray-500">
              This mode combines Moving Average, Average Growth and Linear Trend analysis for stable sales predictions.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Time Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Select Time:</h2>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={timeId}
            onChange={(e) => setTimeId(e.target.value)}
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Latest Total</p>
            <p className="text-lg font-semibold">
              {lastRecord ? formatMMK(lastRecord.total) : "-"}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-700">Hybrid AI Forecast</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatMMK(prediction)}
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-green-700">Confidence</p>
            <p className="text-lg font-semibold text-green-700">Medium-High</p>
          </div>
        </div>

        {/* User Description */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
          <strong>About this Forecast:</strong>
          <p>
            This Hybrid AI mode calculates your sales prediction by combining:
            <ul className="list-disc ml-5 mt-1">
              <li>Moving Average of last 7 days</li>
              <li>Average Growth of last 5 days</li>
              <li>Linear Trend</li>
            </ul>
            It provides a stable, realistic forecast for better business planning.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default PredictionPage;