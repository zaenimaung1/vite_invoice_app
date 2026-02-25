import React, { useRef, useState, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import { useSettings } from "../context/SettingsContext.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

const VoucherDetail = () => {
  const { settings, formatCurrency, t } = useSettings();
  const isDark = settings.theme === "dark";
  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const vouchersUrl = `${apiBase}/vouchers`;
  const { data, error, isLoading } = useSWR(vouchersUrl, fetcher);
  const { mutate } = useSWRConfig();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const fileInputRef = useRef(null);

  const formatMMK = (v) => formatCurrency(v);
  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const handlePrint = (voucher) => {
    if (!voucher) return;
    const win = window.open("", "_blank");
    if (!win) return;

    const itemsRows = (voucher.items || [])
      .map((it) => {
        const prod = it.product || {};
        const qty = it.quantity ?? it.qty ?? 1;
        const lineTotal = it.cost ?? (prod.price ? prod.price * qty : 0);
        return `<tr>
          <td>${prod.name || "-"}</td>
          <td style="text-align:center">${qty}</td>
          <td style="text-align:right">${formatMMK(lineTotal)}</td>
        </tr>`;
      })
      .join("");

    const dateStr = voucher.date ? new Date(voucher.date).toLocaleString() : "-";

    const shopName = escapeHtml(settings.shopName || "Voucher App");
    const addressLine = settings.address?.trim();
    const phoneLine = settings.phoneNumber?.trim();
    const metaLines = [addressLine, phoneLine].filter(Boolean).map(escapeHtml);

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Voucher ${voucher.voucherId || voucher.id}</title>
          <style>
            body{
              font-family:Arial,Helvetica,sans-serif;
              padding:20px;
            }
            .shop-header{
              text-align:center;
              margin-bottom:15px;
            }
            .shop-header h2{
              margin:0;
              font-size:22px;
            }
            .shop-header p{
              margin:2px 0;
              font-size:13px;
              color:#555;
            }
            hr{
              margin:15px 0;
            }
            h1{
              font-size:18px;
              margin-bottom:8px;
            }
            table{
              width:100%;
              border-collapse:collapse;
              margin-top:12px;
            }
            th,td{
              border:1px solid #ddd;
              padding:8px;
            }
            th{
              background:#f3f4f6;
              text-align:left;
            }
            td{
              text-align:left;
            }
          </style>
        </head>
        <body>
          <div class="shop-header">
            <h2>${shopName}</h2>
            ${metaLines.map((line) => `<p>${line}</p>`).join("")}
          </div>
          <hr/>
          <h1>Voucher ${voucher.voucherId || voucher.id}</h1>
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Customer:</strong> ${voucher.username || "-"}</div>
          <div><strong>Phone:</strong> ${voucher.phoneNumber || voucher.email || "-"}</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center">Quantity</th>
                <th style="text-align:right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div style="margin-top:12px;text-align:right">
            <div><strong>Subtotal: </strong>${formatMMK(voucher.subTotal)}</div>
            <div><strong>Tax: </strong>${formatMMK(voucher.tax)}</div>
            <div style="font-size:16px;margin-top:6px">
              <strong>Total: </strong>${formatMMK(voucher.grandTotal)}
            </div>
          </div>
        </body>
      </html>
      `;

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      try {
        win.print();
      } catch (e) {}
    }, 300);
  };

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingId(String(id));
      await fetch(`${vouchersUrl}/${id}`, { method: "DELETE" });
      mutate(vouchersUrl);
      toast.success("Voucher deleted.");
    } catch (e) {
      toast.error("Failed to delete voucher.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVouchers = (data || []).filter((v) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      const name = (v.username || "").toLowerCase();
      const vid = String(v.voucherId || v.id || "").toLowerCase();
      const matchesText = name.includes(term) || vid.includes(term);
      if (!matchesText) return false;
    }

    if (filterDate) {
      if (!v.date) return false;
      const d = String(v.date).slice(0, 10);
      if (d !== filterDate) return false;
    }

    return true;
  });

  const paginatedVouchers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVouchers.slice(start, start + pageSize);
  }, [filteredVouchers, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const exportThisMonth = () => {
    if (!filteredVouchers || filteredVouchers.length === 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const rows = filteredVouchers
      .filter((v) => {
        if (!v.date) return false;
        const d = new Date(v.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .map((v) => ({
        id: v.id,
        voucherId: v.voucherId || v.id,
        username: v.username || "",
        phoneNumber: v.phoneNumber || v.email || "",
        date: v.date,
        subTotal: v.subTotal || 0,
        tax: v.tax || 0,
        grandTotal: v.grandTotal || 0,
        items: JSON.stringify(v.items || []),
      }));

    if (rows.length === 0) {
      toast("No vouchers for this month to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "vouchers");
    const monthLabel = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    XLSX.writeFile(wb, `vouchers-${monthLabel}.xlsx`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws);

      for (const row of rows) {
        const voucher = {
          id: row.id || Date.now(),
          username: row.username || "",
          phoneNumber: row.phoneNumber || row.email || "",
          voucherId: row.voucherId || `V-${Date.now()}`,
          date: row.date || new Date().toISOString(),
          items: row.items ? JSON.parse(row.items) : [],
          subTotal: Number(row.subTotal) || 0,
          tax: Number(row.tax) || 0,
          grandTotal: Number(row.grandTotal) || 0,
        };
        await fetch(vouchersUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(voucher),
        });
      }

      mutate(vouchersUrl);
      toast.success("Import completed.");
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  return (
    <div
      className={`relative overflow-x-auto shadow-md rounded-lg border ${
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
      }`}
    >
      <Toaster />
      <input
        ref={fileInputRef}
        onChange={handleFile}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      <div
        className={`p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b rounded-t-lg ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-xl w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchVouchers")}
            className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 accent-ring ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400"
                : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
            }`}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={`w-full sm:w-auto px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 accent-ring ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={exportThisMonth}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            <span>{t("exportThisMonth")}</span>
          </button>
          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide accent-bg rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            <span>{t("importVouchers")}</span>
          </button>
        </div>
      </div>

      <table className={`w-full text-sm text-left ${isDark ? "text-slate-200" : "text-gray-700"}`}>
        <thead className={`${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-gray-100 border-gray-200"} border-b`}>
          <tr>
            <th className="px-6 py-3 font-semibold">{t("voucherIdLabel")}</th>
            <th className="px-6 py-3 font-semibold">{t("customerNameLabel")}</th>
            <th className="px-6 py-3 font-semibold">{t("productNameLabel")}</th>
            <th className="px-6 py-3 font-semibold">{t("totalPriceLabel")}</th>
            <th className="px-6 py-3 font-semibold">{t("dateLabelTable")}</th>
            <th className="px-6 py-3 font-semibold text-right">{t("actionLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan="6" className={`text-center py-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {t("loading")}
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-red-500">
                {t("noVoucher")}
              </td>
            </tr>
          )}

          {paginatedVouchers.map((voucher, index) => (
            <tr
              key={voucher.id}
              className={
                index % 2 === 0
                  ? isDark
                    ? "bg-slate-800"
                    : "bg-gray-50"
                  : isDark
                  ? "bg-slate-900"
                  : "bg-white"
              }
            >
              <td className="px-6 py-4 font-medium">{voucher.voucherId || voucher.id}</td>
              <td className="px-6 py-4">{voucher.username || "-"}</td>
              <td className="px-6 py-4">
                {(() => {
                  const names = (voucher.items || [])
                    .map((item) => item?.product?.name)
                    .filter(Boolean);
                  if (names.length === 0) return "-";
                  if (names.length <= 3) return names.join(", ");
                  return `${names.slice(0, 3).join(", ")}, ...`;
                })()}
              </td>
              <td className="px-6 py-4 font-medium">{formatMMK(voucher.grandTotal)}</td>
              <td className="px-6 py-4">{new Date(voucher.date).toLocaleString()}</td>
              <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setSelectedVoucher(voucher)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      isDark
                        ? "text-slate-100 bg-slate-700 hover:bg-slate-600"
                        : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    }`}
                  >
                    {t("details")}
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    disabled={deletingId === String(voucher.id)}
                    aria-label="Delete voucher"
                    className={`px-3 py-1 text-xs rounded-full disabled:opacity-50 ${
                      isDark
                        ? "text-red-200 bg-red-900/50 hover:bg-red-900"
                        : "text-red-700 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    {deletingId === String(voucher.id) ? t("deleting") : t("delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredVouchers.length === 0 && !isLoading && (
            <tr>
              <td colSpan="6" className={`text-center py-4 italic ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {t("noVouchersFound")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 mb-4 flex-wrap">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded-full disabled:opacity-50 transition ${
              isDark
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {"<<"} {t("prev")}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded-full transition ${
                p === page
                  ? "accent-bg"
                  : isDark
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-full disabled:opacity-50 transition ${
              isDark
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("next")} {">>"}
          </button>
        </div>
      )}

      {selectedVoucher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setSelectedVoucher(null)}
        >
          <div
            className={`rounded-lg shadow-lg w-11/12 max-w-2xl p-6 ${
              isDark ? "bg-slate-900 text-slate-100" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("voucherDetails")}</h3>
              <div className="inline-flex items-center gap-3">
                <button
                  onClick={() => handlePrint(selectedVoucher)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  {t("print")}
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className={`text-sm px-3 py-1 rounded ${
                    isDark ? "bg-slate-700 text-slate-100" : "bg-black text-white"
                  }`}
                >
                  {t("close")}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                <thead className={isDark ? "bg-slate-800" : "bg-gray-100"}>
                  <tr>
                    <th className="px-3 py-2">{t("productLabel")}</th>
                    <th className="px-3 py-2">{t("quantityLabel")}</th>
                    <th className="px-3 py-2 text-right">{t("lineTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedVoucher.items || []).map((it, i) => {
                    const prod = it.product || {};
                    const qty = it.quantity ?? it.qty ?? 1;
                    const lineTotal =
                      it.cost ?? (prod.price ? prod.price * qty : 0);
                    return (
                      <tr
                        key={i}
                        className={
                          i % 2 === 0
                            ? isDark
                              ? "bg-slate-900"
                              : "bg-white"
                            : isDark
                            ? "bg-slate-800"
                            : "bg-gray-50"
                        }
                      >
                        <td className="px-3 py-2">{prod.name || "-"}</td>
                        <td className="px-3 py-2">{qty}</td>
                        <td className="px-3 py-2 text-right">{formatMMK(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-6 mt-4 flex-wrap text-right">
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {t("subtotal")}
              </div>
              <div className="font-semibold">{formatMMK(selectedVoucher.subTotal)}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {t("taxLabel")}
              </div>
              <div className="font-semibold">{formatMMK(selectedVoucher.tax)}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {t("total")}
              </div>
              <div className="font-semibold">{formatMMK(selectedVoucher.grandTotal)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetail;
