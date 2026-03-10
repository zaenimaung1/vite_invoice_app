import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useSettings } from "../context/SettingsContext.jsx";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { settings, updateSettings, t } = useSettings();
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

  const cardClass = "card p-5";

  const labelClass = "block text-xs font-semibold uppercase tracking-wide";

  const inputClass = "mt-1 w-full rounded-lg border px-3 py-2 text-sm accent-ring";

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
            <p style={{ color: "var(--text-secondary)" }}>
              {t("settingsSubtitle")}
            </p>
          </div>
          <Link to="/" className="btn btn-ghost text-sm">
            {t("backToDashboard")}
          </Link>
        </div>

        <div className="mt-6 grid gap-6">
          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {t("storeDetails")}
              </h2>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>01</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("shopName")}</label>
                <input
                  type="text"
                  value={draft.shopName}
                  onChange={updateField("shopName")}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("phoneNumber")}</label>
                <input
                  type="tel"
                  value={draft.phoneNumber}
                  onChange={updateField("phoneNumber")}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("address")}</label>
                <input
                  type="text"
                  value={draft.address}
                  onChange={updateField("address")}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("finance")}</h2>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>02</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("taxPercent")}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draft.taxPercent}
                  onChange={updateTax}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("language")}</label>
                <select
                  value={draft.language}
                  onChange={updateField("language")}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
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
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>03</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 items-end">
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("theme")}</label>
                <select
                  value={draft.theme}
                  onChange={updateField("theme")}
                  className={inputClass}
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                >
                  <option value="light">{t("light")}</option>
                  <option value="dark">{t("dark")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--text-secondary)" }}>{t("accentColor")}</label>
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={updateField("accentColor")}
                  className="mt-1 h-10 w-full rounded-lg border p-1"
                  style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
                />
              </div>
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--card-border)", background: "var(--card-muted)" }}
              >
                <div className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
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
          <button type="button" onClick={handleConfirm} className="btn btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </Container>
  );
};

export default SettingsPage;
