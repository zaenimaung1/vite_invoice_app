import React from 'react'
import useRecordStore from '../store/useRecordStroe'
import VoucherTableRow from './VoucherTableRow'

const SaleTable = () => {
  const { records, removeRecord } = useRecordStore()

  const TAX_RATE = 0.08; // 8%

  const subTotal = records.reduce((sum, rec) => sum + rec.cost, 0);
  const tax = subTotal * TAX_RATE;
  const grandTotal = subTotal + tax;

  const fmt = (v) =>
    `$${v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="w-full py-6">
      

      <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 table-fixed">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="w-12 px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="w-28 px-4 py-3 text-right">Price</th>
              <th className="w-20 px-4 py-3 text-center">Qty</th>
              <th className="w-40 px-4 py-3 text-right">Total</th>
              <th className="w-28 px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-gray-600 text-center">
                  There is no data
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <VoucherTableRow key={record.id ?? index} record={record} onDelete={removeRecord} />
              ))
            )}

            {/* Totals section */}
            {records.length > 0 && (
              <>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-700">Subtotal</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(subTotal)}</td>
                  <td></td>
                </tr>

                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-700">Tax (8%)</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(tax)}</td>
                  <td></td>
                </tr>

                <tr className="bg-indigo-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-800">Grand Total</td>
                  <td className="px-4 py-3 text-right text-indigo-700 font-bold text-lg">{fmt(grandTotal)}</td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SaleTable;
