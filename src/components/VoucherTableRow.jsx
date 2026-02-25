import React, { useEffect, useState } from "react";
import useRecordStore from "../store/useRecordStroe";
import toast from "react-hot-toast";

/**
 * VoucherTableRow
 * Renders a single row for a voucher/record inside a table.
 * Props:
 *  - record: { id, product, quantity, cost, created_at }
 *  - index: row number
 */
const VoucherTableRow = ({ record = {}, index = 0 }) => {
  const { removeRecord, changeQuantity } = useRecordStore();

  const product = record.product ?? {};
  const price = Number(product.price || 0);

  // Local state for quantity
  const [qty, setQty] = useState(record.quantity ?? 1);

  // Sync with store if record.quantity changes externally
  useEffect(() => {
    setQty(record.quantity ?? 1);
  }, [record.quantity]);

  const total = record.cost ?? price * qty;

  const fmt = (v) =>
    typeof v === "number"
      ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : v;

  const handleDelete = () => {
    removeRecord(record.id);
    toast.success(`Record ${product.name ?? ""} deleted successfully!`);
  };

  const handleDecrease = () => {
    if (qty > 1) {
      const newQty = qty - 1;
      setQty(newQty);
      changeQuantity(record.id, newQty);
    } else {
      toast.error("Quantity cannot be less than 1");
    }
  };

  const handleIncrease = () => {
    const newQty = qty + 1;
    if (typeof product.stock === "number" && newQty > product.stock) {
      toast.error("Quantity exceeds available stock");
      return;
    }
    setQty(newQty);
    changeQuantity(record.id, newQty);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-gray-600">{index + 1}</td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0" />
          <div>
            <div className="font-medium text-gray-800">{product.name ?? "—"}</div>
            <div className="text-xs text-gray-500">{product.sku ?? ""}</div>
            <div className="text-xs text-gray-500">
              Stock: {typeof product.stock === "number" ? product.stock : "-"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-right font-medium text-gray-800">{fmt(price)}</td>

      <td className="px-4 py-4 text-gray-500 text-center">
        <div className="inline-flex items-center gap-2 justify-center">
          <button
            className="px-2 bg-gray-300 text-black rounded active:scale-50"
            onClick={handleDecrease}
          >
            -
          </button>
          <span>{qty}</span>
          <button
            className="px-2 bg-gray-300 text-black rounded active:scale-50"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
      </td>

      <td className="px-4 py-4 text-right font-semibold text-gray-800">{fmt(total)}</td>

      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2 justify-end">
          <button
            onClick={handleDelete}
            aria-label={`Delete voucher ${record.id}`}
            className="px-3 py-1 text-xs text-red-700 bg-red-50 rounded-full hover:bg-red-100 active:scale-75 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default VoucherTableRow;