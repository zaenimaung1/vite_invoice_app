import React from "react";
import useRecordStore from "../store/useRecordStroe";
import VoucherTableRow from "./VoucherTableRow";
import { useSettings } from "../context/SettingsContext.jsx";

const SaleTable = () => {
  const { records, removeRecord } = useRecordStore();
  const { formatCurrency, settings, taxRate, t } = useSettings();

  const subTotal = records.reduce((sum, rec) => sum + rec.cost, 0);
  const tax = subTotal * taxRate;
  const grandTotal = subTotal + tax;

  return (
    <div className="w-full py-6">
      <div className="relative overflow-x-auto card">
        <table className="w-full min-w-[700px] text-sm text-left table-auto" style={{ color: "var(--text-primary)" }}>
          <thead className="text-xs uppercase tracking-wide" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>
            <tr>
              <th className="w-12 px-3 sm:px-4 py-3">#</th>
              <th className="px-3 sm:px-4 py-3">{t("productLabel")}</th>
              <th className="w-28 px-3 sm:px-4 py-3 text-right">{t("fullPrice")}</th>
              <th className="w-20 px-3 sm:px-4 py-3 text-center">{t("quantityLabel")}</th>
              <th className="w-40 px-3 sm:px-4 py-3 text-right">{t("totalLabel")}</th>
              <th className="w-28 px-3 sm:px-4 py-3 text-right">{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 sm:px-4 py-4 text-sm text-center"
                  style={{ color: "var(--text-secondary)" }}
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
                <tr style={{ background: "var(--card-muted)" }}>
                  <td colSpan={4} className="px-3 sm:px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>
                    {t("subtotal")}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-semibold whitespace-nowrap">
                    {formatCurrency(subTotal)}
                  </td>
                  <td></td>
                </tr>

                <tr style={{ background: "var(--card-muted)" }}>
                  <td colSpan={4} className="px-3 sm:px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>
                    {t("taxLabel")} ({settings.taxPercent}%)
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-semibold whitespace-nowrap">
                    {formatCurrency(tax)}
                  </td>
                  <td></td>
                </tr>

                <tr style={{ background: "var(--card-muted)" }}>
                  <td colSpan={4} className="px-3 sm:px-4 py-3 text-right font-bold">
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
