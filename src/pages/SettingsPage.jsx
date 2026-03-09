import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useSettings } from "../context/SettingsContext.jsx";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { settings, updateSettings, t } = useSettings();
  const isDark = settings.theme === "dark";
  const [draft, setDraft] = React.useState(settings);

  React.useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const updateField = (key) => (event) => {
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateTax = (event) => {
    const next = Number(event.target.value);
    setDraft((prev) => ({
      ...prev,
      taxPercent: Number.isFinite(next) ? next : 0,
    }));
  };

  const cardClass = `rounded-2xl border shadow-sm p-5 ${
    isDark ? "border-[#2E2E33] bg-[#2A2D34]" : "border-gray-200 bg-white"
  }`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wide ${
    isDark ? "text-[#A1A1AA]" : "text-gray-500"
  }`;

  const inputClass = `mt-1 w-full rounded-lg border px-3 py-2 text-sm accent-ring ${
    isDark
      ? "border-[#3F3F46] bg-[#1E1F23] text-[#F5F5F5]"
      : "border-gray-200 bg-white text-gray-700"
  }`;

  const handleConfirm = () => {
    updateSettings(draft);
    toast.success("Settings saved.");
  };

  return (
    <Container>
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold accent-text">{t("settings")}</h1>
            <p className={isDark ? "text-[#A1A1AA]" : "text-gray-500"}>
              {t("settingsSubtitle")}
            </p>
          </div>
          <Link
            to="/"
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${
              isDark
                ? "border-[#2E2E33] text-[#F5F5F5] hover:bg-[#32353D]"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("backToDashboard")}
          </Link>
        </div>

        <div className="mt-6 grid gap-6">
          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {t("storeDetails")}
              </h2>
              <span className={`text-xs ${isDark ? "text-[#71717A]" : "text-gray-400"}`}>01</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className={labelClass}>{t("shopName")}</label>
                <input
                  type="text"
                  value={draft.shopName}
                  onChange={updateField("shopName")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("phoneNumber")}</label>
                <input
                  type="tel"
                  value={draft.phoneNumber}
                  onChange={updateField("phoneNumber")}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t("address")}</label>
                <input
                  type="text"
                  value={draft.address}
                  onChange={updateField("address")}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("finance")}</h2>
              <span className={`text-xs ${isDark ? "text-[#71717A]" : "text-gray-400"}`}>02</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className={labelClass}>{t("taxPercent")}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draft.taxPercent}
                  onChange={updateTax}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("language")}</label>
                <select
                  value={draft.language}
                  onChange={updateField("language")}
                  className={inputClass}
                >
                  <option value="en">{t("english")}</option>
                  <option value="my">{t("myanmar")}</option>
                </select>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("appearance")}</h2>
              <span className={`text-xs ${isDark ? "text-[#71717A]" : "text-gray-400"}`}>03</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 items-end">
              <div>
                <label className={labelClass}>{t("theme")}</label>
                <select
                  value={draft.theme}
                  onChange={updateField("theme")}
                  className={inputClass}
                >
                  <option value="light">{t("light")}</option>
                  <option value="dark">{t("dark")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("accentColor")}</label>
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={updateField("accentColor")}
                  className={`mt-1 h-10 w-full rounded-lg border p-1 ${
                    isDark ? "border-[#3F3F46] bg-[#1E1F23]" : "border-gray-200 bg-white"
                  }`}
                />
              </div>
              <div
                className={`rounded-xl border p-3 ${
                  isDark ? "border-[#2E2E33] bg-[#1E1F23]" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className={`text-xs uppercase tracking-wide ${isDark ? "text-[#71717A]" : "text-gray-400"}`}>
                  {t("preview")}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full accent-bg" />
                  <span className="text-sm">Accent</span>
                </div>
                <div className="mt-2 h-2 rounded-full accent-bg" />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg accent-bg text-white font-semibold hover:opacity-90 transition-transform active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </Container>
  );
};

export default SettingsPage;
