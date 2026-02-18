import React, { useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import * as XLSX from "xlsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

const VoucherDetail = () => {
  const { data, error, isLoading } = useSWR(
    import.meta.env.VITE_API_URL + "/vouchers",
    fetcher
  );

  const {mutate} = useSWRConfig();
  const handleDelete = async (id) => {
    await fetch(import.meta.env.VITE_API_URL + "/vouchers/" + id, {
      method: "DELETE",
    });
      mutate(import.meta.env.VITE_API_URL + "/vouchers");
  };

  const fileInputRef = useRef(null);

  const exportToday = () => {
    if (!data || data.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const rows = data
      .filter((v) => v.date && v.date.slice(0, 10) === today)
      .map((v) => ({
        id: v.id,
        voucherId: v.voucherId || v.id,
        username: v.username || "",
        phoneNumber: v.phoneNumber || v.email || "",
        date: v.date,
        subTotal: v.subTotal || "",
        tax: v.tax || "",
        grandTotal: v.grandTotal || "",
        items: JSON.stringify(v.items || []),
      }));

    if (rows.length === 0) {
      alert("No vouchers for today to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "vouchers");
    XLSX.writeFile(wb, `vouchers-${today}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

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

      // Expecting exported format; items column is JSON string
      for (const row of rows) {
        const voucher = {
          username: row.username || "",
          phoneNumber: row.phoneNumber || row.email || "",
          voucherId: row.voucherId || `V-${Date.now()}`,
          date: row.date || new Date().toISOString(),
          items: row.items ? JSON.parse(row.items) : [],
          subTotal: Number(row.subTotal) || 0,
          tax: Number(row.tax) || 0,
          grandTotal: Number(row.grandTotal) || 0,
        };

        try {
          await fetch(import.meta.env.VITE_API_URL + "/vouchers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(voucher),
          });
        } catch (err) {
          console.error("Import row failed:", err, row);
        }
      }

      mutate(import.meta.env.VITE_API_URL + "/vouchers");
      alert("Import completed.");
    };
    reader.readAsBinaryString(file);
    // reset input
    e.target.value = null;
  };


  return (
    <div className="relative overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
      <div className="p-4 flex gap-2 justify-end">
        <input
          ref={fileInputRef}
          onChange={handleFile}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
        <button onClick={exportToday} className="px-3 py-1 text-sm bg-green-600 text-white rounded">
          Export Today's Vouchers (Excel)
        </button>
        <button onClick={handleImportClick} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
          Import Vouchers (Excel)
        </button>
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
          {/* Loading state */}
          {isLoading && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {/* Error state */}
          {error && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-red-500">
                Failed to load vouchers.
              </td>
            </tr>
          )}

          {/* Data */}
          {data?.map((voucher, index) => (
            <tr
              key={voucher.id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-6 py-4 font-medium">{voucher.voucherId || voucher.id}</td>
              <td className="px-6 py-4">{voucher.username || "-"}</td>
              <td className="px-6 py-4">
                {voucher.items.map((item) => item.product.name).join(", ")}
              </td>
             
              <td className="px-6 py-4 font-medium">${voucher.grandTotal.toFixed(2)}</td>
              <td className="px-6 py-4">{new Date(voucher.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                
                <button onClick={() => handleDelete(voucher.id)} className="px-3 py-1 text-xs text-red-600 bg-blue-50 rounded-full hover:bg-blue-100">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* No data */}
          {data?.length === 0 && !isLoading && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                No vouchers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherDetail;
