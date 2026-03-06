import React from "react";
import useRecordStore from "../store/useRecordStroe";
import VoucherTableRow from "./VoucherTableRow";
import { useSettings } from "../context/SettingsContext.jsx";

const SaleTable = () => {
  const { records, removeRecord } = useRecordStore();
  const { formatCurrency, settings, taxRate, t } = useSettings();
  const isDark = settings.theme === "dark";

  const subTotal = records.reduce((sum, rec) => sum + rec.cost, 0);
  const tax = subTotal * taxRate;
  const grandTotal = subTotal + tax;

  return (
    <div className="w-full py-6">
      <div
        className={`relative overflow-x-auto rounded-lg border shadow-sm ${
          isDark ? "border-[#2E2E33] bg-[#1E1F23]" : "border-gray-200 bg-white"
        }`}
      >
        <table className={`w-full min-w-[700px] text-sm text-left table-auto ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
          <thead className={`${isDark ? "bg-[#24262C] text-[#A1A1AA]" : "bg-gray-50 text-gray-500"} text-xs uppercase tracking-wide`}>
            <tr>
              <th className="w-12 px-3 sm:px-4 py-3">#</th>
              <th className="px-3 sm:px-4 py-3">{t("productLabel")}</th>
              <th className="w-28 px-3 sm:px-4 py-3 text-right">{t("fullPrice")}</th>
              <th className="w-20 px-3 sm:px-4 py-3 text-center">{t("quantityLabel")}</th>
              <th className="w-40 px-3 sm:px-4 py-3 text-right">{t("totalLabel")}</th>
              <th className="w-28 px-3 sm:px-4 py-3 text-right">{t("actions")}</th>
            </tr>
          </thead>

          <tbody className={`${isDark ? "divide-[#2E2E33]" : "divide-gray-100"} divide-y`}>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className={`px-3 sm:px-4 py-4 text-sm text-center ${
                    isDark ? "text-[#A1A1AA]" : "text-gray-600"
                  }`}
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <VoucherTableRow
                  key={record.id ?? index}
                  record={record}
                  index={index}  
                  onDelete={removeRecord}
                />
              ))
            )}

            {/* Totals section */}
            {records.length > 0 && (
              <>
                <tr className={isDark ? "bg-[#2A2D34]" : "bg-gray-50"}>
                  <td colSpan={4} className={`px-3 sm:px-4 py-3 text-right font-medium ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>
                    {t("subtotal")}
                  </td>
                  <td className={`px-3 sm:px-4 py-3 text-right font-semibold whitespace-nowrap ${isDark ? "text-[#F5F5F5]" : "text-gray-900"}`}>
                    {formatCurrency(subTotal)}
                  </td>
                  <td></td>
                </tr>

                <tr className={isDark ? "bg-[#2A2D34]" : "bg-gray-50"}>
                  <td colSpan={4} className={`px-3 sm:px-4 py-3 text-right font-medium ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>
                    {t("taxLabel")} ({settings.taxPercent}%)
                  </td>
                  <td className={`px-3 sm:px-4 py-3 text-right font-semibold whitespace-nowrap ${isDark ? "text-[#F5F5F5]" : "text-gray-900"}`}>
                    {formatCurrency(tax)}
                  </td>
                  <td></td>
                </tr>

                <tr className={isDark ? "bg-[#2A2D34]" : "bg-gray-50"}>
                  <td colSpan={4} className={`px-3 sm:px-4 py-3 text-right font-bold ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>
                    {t("grandTotal")}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-bold text-lg accent-text whitespace-nowrap">
                    {formatCurrency(grandTotal)}
                  </td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleTable;
