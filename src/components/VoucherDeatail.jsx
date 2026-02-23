import React, { useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const fetcher = (url) => fetch(url).then((res) => res.json());

const VoucherDetail = () => {
  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const vouchersUrl = `${apiBase}/vouchers`;
  const { data, error, isLoading } = useSWR(vouchersUrl, fetcher);
  const { mutate } = useSWRConfig();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  const formatMMK = (v) => Number(v || 0).toLocaleString("en-US") + " Ks";

  // PRINT VOUCHER
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

    const dateStr = voucher.date
      ? new Date(voucher.date).toLocaleString()
      : "-";

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
            <h2>Kibo Convenience Store</h2>
            <p>Myeik, Tanintharyi</p>
            <p>Phone: 09791579929</p>
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
      try { win.print(); } catch (e) {}
    }, 300);
  };

  // DELETE VOUCHER
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


  // FILTER VOUCHERS BY SEARCH (name or voucherId)
  const filteredVouchers = (data || []).filter((v) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = (v.username || "").toLowerCase();
    const vid = String(v.voucherId || v.id || "").toLowerCase();
    return name.includes(term) || vid.includes(term);
  });

  // EXPORT TODAY VOUCHERS
  const exportToday = () => {
    if (!filteredVouchers || filteredVouchers.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const rows = filteredVouchers
      .filter((v) => v.date && v.date.slice(0, 10) === today)
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
      toast("No vouchers for today to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "vouchers");
    XLSX.writeFile(wb, `vouchers-${today}.xlsx`);
  };

  // IMPORT VOUCHERS
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
    <div className="relative overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
      <Toaster />
      <input
        ref={fileInputRef}
        onChange={handleFile}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-2 max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by voucher ID or customer name..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={exportToday}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            <span>Export Today (Excel)</span>
          </button>
          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            <span>Import Vouchers</span>
          </button>
        </div>
      </div>

      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 font-semibold">Voucher ID</th>
            <th className="px-6 py-3 font-semibold">Customer Name</th>
            <th className="px-6 py-3 font-semibold">Product Name</th>
            <th className="px-6 py-3 font-semibold">Total Price</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-red-500">
                There is no voucher to show.
              </td>
            </tr>
          )}

          {filteredVouchers.map((voucher, index) => (
            <tr key={voucher.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="px-6 py-4 font-medium">{voucher.voucherId || voucher.id}</td>
              <td className="px-6 py-4">{voucher.username || "-"}</td>
              <td className="px-6 py-4">
                {(voucher.items || [])
                  .map((item) => item?.product?.name || "-")
                  .join(", ")}
              </td>
              <td className="px-6 py-4 font-medium">{formatMMK(voucher.grandTotal)}</td>
              <td className="px-6 py-4">
                {new Date(voucher.date).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setSelectedVoucher(voucher)}
                    className="px-3 py-1 text-xs text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100"
                  >
                    Details
                  </button>
                 <button
                  onClick={() => handleDelete(voucher.id)}
                  disabled={deletingId === String(voucher.id)} 
                  aria-label="Delete voucher"
                  className="px-3 py-1 text-xs text-red-700 bg-red-50 rounded-full hover:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === String(voucher.id) ? "Deleting..." : "Delete"}
                </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredVouchers.length === 0 && !isLoading && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                No vouchers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Voucher Details Modal */}
      {selectedVoucher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setSelectedVoucher(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Voucher Details</h3>
              <div className="inline-flex items-center gap-3">
                <button
                  onClick={() => handlePrint(selectedVoucher)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Print
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="text-sm text-white bg-black px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedVoucher.items || []).map((it, i) => {
                    const prod = it.product || {};
                    const qty = it.quantity ?? it.qty ?? 1;
                    const lineTotal = it.cost ?? (prod.price ? prod.price * qty : 0);
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
              <div className="text-sm text-gray-500">Subtotal</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.subTotal)}</div>
              <div className="text-sm text-gray-500">Tax</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.tax)}</div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-semibold">{formatMMK(selectedVoucher.grandTotal)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetail;
