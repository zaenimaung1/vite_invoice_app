import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";

const ErrorPage = () => {
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";
  const navigate = useNavigate();
  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? "app-glow" : "bg-gradient-to-br from-slate-50 via-white to-emerald-50"}`}>
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-gradient)" }} />
      <div className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-emerald-400/20" : "bg-emerald-300/40"}`} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="card w-full max-w-3xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <div className={`text-7xl sm:text-8xl font-black tracking-tight ${isDark ? "text-[#F5F5F5]" : "text-slate-900"}`}>
                404
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.3em] text-emerald-500">Not Found</div>
              <h1 className={`mt-4 text-2xl sm:text-3xl font-semibold ${isDark ? "text-[#F5F5F5]" : "text-slate-800"}`}>
                You took a wrong turn
              </h1>
              <p className={`mt-3 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                The page you were looking for moved, was deleted, or never existed. Let’s get you back on track.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link to="/" className="btn btn-primary text-sm">Go Home</Link>
                <button onClick={() => navigate(-1)} className="btn btn-ghost text-sm">Go Back</button>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="relative p-6 rounded-2xl border" style={{ borderColor: "var(--card-border)", background: "var(--card-muted)" }}>
                <div className="absolute -top-3 -left-3 px-3 py-1 text-xs font-semibold rounded-full" style={{ background: "var(--accent-gradient)", color: "#fff" }}>
                  Tip
                </div>
                <div className={`text-sm ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                  Try checking the URL, or use the search on the voucher page to find what you need.
                </div>
                <div className="mt-4 text-xs uppercase tracking-widest text-emerald-500">Status</div>
                <div className={`mt-1 text-lg font-semibold ${isDark ? "text-[#F5F5F5]" : "text-slate-800"}`}>Route Missing</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="card p-4 text-center">
                  <div className="text-xs text-emerald-500 uppercase tracking-wider">Code</div>
                  <div className={`mt-1 text-2xl font-bold ${isDark ? "text-[#F5F5F5]" : "text-slate-900"}`}>404</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-xs text-emerald-500 uppercase tracking-wider">Module</div>
                  <div className={`mt-1 text-lg font-semibold ${isDark ? "text-[#F5F5F5]" : "text-slate-900"}`}>Voucher App</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
