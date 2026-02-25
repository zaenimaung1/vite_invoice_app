import React from "react";
import { Link } from "react-router-dom";
import Container from "./Container";
import { useSettings } from "../context/SettingsContext.jsx";

const Header = () => {
  const { settings, t } = useSettings();
  const isDark = settings.theme === "dark";

  const addressLine = settings.address?.trim();
  const phoneLine = settings.phoneNumber?.trim();

  return (
    <header className={`${isDark ? "bg-slate-900" : "bg-white"} shadow`}>
      <Container className="py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={`text-lg font-semibold ${
                isDark ? "text-slate-100" : "text-gray-800"
              } accent-text`}
            >
              {settings.shopName || "Voucher App"}
            </h1>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              {addressLine && <div>{addressLine}</div>}
              {phoneLine && <div>{phoneLine}</div>}
              {!addressLine && !phoneLine && <div>{t("manageSettings")}</div>}
            </div>
          </div>

          <Link
            to="/settings"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition ${
              isDark ? "text-slate-100" : "text-white"
            } accent-bg hover:opacity-90`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.4 15.5l1.6 1.3-2 3.4-2-.8a7.8 7.8 0 0 1-2.5 1.4l-.3 2.1H10l-.3-2.1a7.8 7.8 0 0 1-2.5-1.4l-2 .8-2-3.4 1.6-1.3a8 8 0 0 1 0-3l-1.6-1.3 2-3.4 2 .8a7.8 7.8 0 0 1 2.5-1.4L10 1h4l.3 2.1a7.8 7.8 0 0 1 2.5 1.4l2-.8 2 3.4-1.6 1.3a8 8 0 0 1 0 3Z"
              />
            </svg>
            {t("settings")}
          </Link>
        </div>
      </Container>
    </header>
  );
};

export default Header;
