import React, { useState, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
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
  const [filterMonth, setFilterMonth] = useState(
    () => new Date().toISOString().slice(0, 7)
  );
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      .map((it, i) => {
        const prod = it.product || {};
        const qty = it.quantity ?? it.qty ?? 1;
        const lineTotal = it.cost ?? (prod.price ? prod.price * qty : 0);
        return `<tr>
          <td style="text-align:center">${i + 1}</td>
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
            body { font-family: Arial, Helvetica, sans-serif; padding:20px; }
            .shop-header { text-align:center; margin-bottom:15px; }
            .shop-header h2 { margin:0; font-size:22px; }
            .shop-header p { margin:2px 0; font-size:13px; color:#555; }
            hr { margin:15px 0; }
            h1 { font-size:18px; margin-bottom:8px; }
            table { width:100%; border-collapse:collapse; margin-top:12px; }
            th,td { border:1px solid #ddd; padding:8px; }
            th { background:#f3f4f6; text-align:left; }
            td { text-align:left; }
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
                <th style="text-align:center">#</th>
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
            <div style="font-size:16px;margin-top:6px"><strong>Total: </strong>${formatMMK(voucher.grandTotal)}</div>
          </div>
          <div style="margin-top:30px;text-align:center;font-size:14px;color:#555;">
            <hr style="margin-bottom:10px;" />
            <div><strong>Thank you for choosing us!</strong></div>
            <div>We appreciate your business ❤️</div>
          </div>
        </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      try { win.print(); } catch (e) {}
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
    if (filterMonth) {
      if (!v.date) return false;
      const d = String(v.date).slice(0, 7);
      if (d !== filterMonth) return false;
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
  const handlePageChange = (newPage) => { if (newPage < 1 || newPage > totalPages) return; setPage(newPage); };
  const monthTotal = useMemo(() => {
    if (!filterMonth) return 0;
    return (data || []).reduce((sum, v) => {
      if (!v?.date) return sum;
      return String(v.date).slice(0, 7) === filterMonth
        ? sum + (Number(v.grandTotal) || 0)
        : sum;
    }, 0);
  }, [filterMonth, data]);

  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (data || []).reduce((sum, v) => {
      if (!v?.date) return sum;
      return String(v.date).slice(0, 10) === today
        ? sum + (Number(v.grandTotal) || 0)
        : sum;
    }, 0);
  }, [data]);

  return (
    <div className={`relative overflow-hidden shadow-md rounded-lg border ${isDark ? "bg-[#1E1F23] border-[#2E2E33]" : "bg-white border-gray-200"}`}>
      <Toaster />

      {/* Filter & Buttons */}
      <div className={`p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b rounded-t-lg ${isDark ? "bg-[#24262C] border-[#2E2E33]" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-xl w-full">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchVouchers")} className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 accent-ring ${isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5] placeholder:text-[#71717A]" : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"}`} />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => {
              const month = e.target.value;
              setFilterMonth(month);
              if (filterDate && month && !filterDate.startsWith(month)) {
                setFilterDate("");
              }
            }}
            className={`w-full sm:w-auto px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 accent-ring ${isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5]" : "bg-white border-gray-300 text-gray-800"}`}
          />
          <input
            type="date"
            value={filterDate}
            min={filterMonth ? `${filterMonth}-01` : undefined}
            max={
              filterMonth
                ? `${filterMonth}-${String(
                    new Date(
                      Number(filterMonth.slice(0, 4)),
                      Number(filterMonth.slice(5, 7)),
                      0
                    ).getDate()
                  ).padStart(2, "0")}`
                : undefined
            }
            onChange={(e) => {
              const date = e.target.value;
              setFilterDate(date);
              if (date && !filterMonth) {
                setFilterMonth(date.slice(0, 7));
              } else if (date && filterMonth && !date.startsWith(filterMonth)) {
                setFilterMonth(date.slice(0, 7));
              }
            }}
            className={`w-full sm:w-auto px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 accent-ring ${isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5]" : "bg-white border-gray-300 text-gray-800"}`}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <div className={`px-3 py-2 text-xs font-semibold rounded-md border ${isDark ? "border-[#3F3F46] text-[#F5F5F5] bg-[#1E1F23]" : "border-gray-200 text-gray-700 bg-white"}`}>
            {t("monthlyRevenue")}: <span className="accent-text">{formatMMK(monthTotal)}</span>
          </div>
          <div className={`px-3 py-2 text-xs font-semibold rounded-md border ${isDark ? "border-[#3F3F46] text-[#F5F5F5] bg-[#1E1F23]" : "border-gray-200 text-gray-700 bg-white"}`}>
            {t("todayRevenue")}: <span className="accent-text">{formatMMK(todayTotal)}</span>
          </div>
        </div>
      </div>

      {/* Voucher Table */}
      <div className="overflow-x-auto">
        <table className={`w-full min-w-[760px] text-sm text-left table-auto ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
          <thead className={`${isDark ? "bg-[#24262C] border-[#2E2E33] text-[#A1A1AA]" : "bg-gray-100 border-gray-200"} border-b`}>
            <tr>
              <th className="px-3 sm:px-6 py-3 font-semibold">{t("voucherIdLabel")}</th>
              <th className="px-3 sm:px-6 py-3 font-semibold">{t("customerNameLabel")}</th>
              <th className="px-3 sm:px-6 py-3 font-semibold">{t("productNameLabel")}</th>
              <th className="px-3 sm:px-6 py-3 font-semibold">{t("totalPriceLabel")}</th>
              <th className="px-3 sm:px-6 py-3 font-semibold">{t("dateLabelTable")}</th>
              <th className="px-3 sm:px-6 py-3 font-semibold text-right">{t("actionLabel")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="6" className={`text-center py-4 ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("loading")}</td>
              </tr>
            )}

            {paginatedVouchers.map((voucher, index) => (
              <tr key={voucher.id} className={index % 2 === 0 ? isDark ? "bg-[#2A2D34]" : "bg-gray-50" : isDark ? "bg-[#1E1F23]" : "bg-white"}>
                <td className="px-3 sm:px-6 py-4 font-medium whitespace-nowrap">{voucher.voucherId || voucher.id}</td>
                <td className="px-3 sm:px-6 py-4">{voucher.username || "-"}</td>
                <td className="px-3 sm:px-6 py-4">
                  {(() => {
                    const names = (voucher.items || []).map((item) => item?.product?.name).filter(Boolean);
                    if (names.length === 0) return "-";
                    if (names.length <= 3) return names.join(", ");
                    return `${names.slice(0, 3).join(", ")}, ...`;
                  })()}
                </td>
                <td className="px-3 sm:px-6 py-4 font-medium whitespace-nowrap">{formatMMK(voucher.grandTotal)}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{new Date(voucher.date).toLocaleString()}</td>
                <td className="px-3 sm:px-6 py-4 text-right">
                  <div className="inline-flex flex-wrap items-center gap-2 justify-end">
                    <button onClick={() => setSelectedVoucher(voucher)} className={`px-3 py-1 text-xs rounded-full transition-transform active:scale-95 ${isDark ? "text-[#F5F5F5] bg-[#32353D] hover:bg-[#3F3F46]" : "text-[#1E1F23] bg-[#A3E635] hover:bg-[#B6F542]"}`}>{t("details")}</button>
                    <button onClick={() => handleDelete(voucher.id)} disabled={deletingId === String(voucher.id)} aria-label="Delete voucher" className={`px-3 py-1 text-xs rounded-full disabled:opacity-50 transition-transform active:scale-95 ${isDark ? "text-red-200 bg-red-900/50 hover:bg-red-900" : "text-red-700 bg-red-50 hover:bg-red-100"}`}>{deletingId === String(voucher.id) ? t("deleting") : t("delete")}</button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredVouchers.length === 0 && !isLoading && (
              <tr>
                <td colSpan="6" className={`text-center py-4 italic ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("noVouchersFound")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 mb-4 flex-wrap">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className={`px-3 py-1 rounded-full disabled:opacity-50 transition ${isDark ? "bg-[#2A2D34] text-[#F5F5F5] hover:bg-[#32353D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{"<<"} {t("prev")}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => handlePageChange(p)} className={`px-3 py-1 rounded-full transition ${p === page ? "accent-bg" : isDark ? "bg-[#2A2D34] text-[#F5F5F5] hover:bg-[#32353D]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{p}</button>
          ))}
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className={`px-3 py-1 rounded-full disabled:opacity-50 transition ${isDark ? "bg-[#2A2D34] text-[#F5F5F5] hover:bg-[#32353D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t("next")} {">>"}</button>
        </div>
      )}

      {/* Voucher Details Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedVoucher(null)}>
          <div className={`rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${isDark ? "bg-[#1E1F23] text-[#F5F5F5]" : "bg-white text-gray-900"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("voucherDetails")}</h3>
              <div className="inline-flex flex-wrap items-center gap-3">
                <button onClick={() => handlePrint(selectedVoucher)} className="px-3 py-1 text-sm bg-[#22C55E] text-white rounded hover:bg-[#4ADE80] transition-transform active:scale-95">{t("print")}</button>
                <button onClick={() => setSelectedVoucher(null)} className={`text-sm px-3 py-1 rounded transition-transform active:scale-95 ${isDark ? "bg-[#32353D] text-[#F5F5F5]" : "bg-black text-white"}`}>{t("close")}</button>
              </div>
            </div>

            {/* Product Table with Serial # */}
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
                <thead className={isDark ? "bg-[#24262C]" : "bg-gray-100"}>
                  <tr>
                    <th className="px-3 py-2">#</th> {/* Serial number */}
                    <th className="px-3 py-2">{t("productLabel")}</th>
                    <th className="px-3 py-2">{t("quantityLabel")}</th>
                    <th className="px-3 py-2 text-right">{t("lineTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedVoucher.items || []).map((it, i) => {
                    const prod = it.product || {};
                    const qty = it.quantity ?? it.qty ?? 1;
                    const lineTotal = it.cost ?? (prod.price ? prod.price * qty : 0);
                    return (
                      <tr key={i} className={i % 2 === 0 ? isDark ? "bg-[#1E1F23]" : "bg-white" : isDark ? "bg-[#2A2D34]" : "bg-gray-50"}>
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{prod.name || "-"}</td>
                        <td className="px-3 py-2">{qty}</td>
                        <td className="px-3 py-2 text-right">{formatMMK(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex items-center justify-end gap-6 mt-4 flex-wrap text-right">
              <div className={`text-sm ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("subtotal")}</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.subTotal)}</div>
              <div className={`text-sm ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("taxLabel")}</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.tax)}</div>
              <div className={`text-sm ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("total")}</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.grandTotal)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetail;
