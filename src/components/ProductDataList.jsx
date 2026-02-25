import React, { useState } from "react";
import { useSWRConfig } from "swr";
import { newtonsCradle } from "ldrs";
import toast from "react-hot-toast";
import { Link } from "react-router-dom"; // updated import
import { useSettings } from "../context/SettingsContext.jsx";

newtonsCradle.register();

const ProductDataList = ({ product = {} }) => {
  const { formatCurrency, settings, t } = useSettings();
  const isDark = settings.theme === "dark";
  const { id, name, price, created_at } = product;

  // Format date (en-GB style)
  const date = new Date(created_at);
  const formattedDate = date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatPrice = (value) => (value ? formatCurrency(value) : "-");

  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const deleteProductBtn = async (id, name) => {
    setLoading(true);
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );
  
      if (!response.ok) {
        throw new Error("Delete failed");
      }
  
      // refresh products
      mutate(`${import.meta.env.VITE_API_URL}/products`);
  
      toast.success(`${name} deleted successfully!`);
    } catch (e) {
      toast.error("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className={isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}>
      <td className={`px-4 py-4 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>{id}</td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md shrink-0 ${isDark ? "bg-slate-800" : "bg-gray-100"}`} />
          <div>
            <div className={`font-medium ${isDark ? "text-slate-100" : "text-gray-800"}`}>{name}</div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>{t("productLabel")}</div>
          </div>
        </div>
      </td>

      <td className={`px-4 py-4 text-right font-medium ${isDark ? "text-slate-100" : "text-gray-800"}`}>
        {formatPrice(price)}
      </td>

      <td className={`px-4 py-4 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>{formattedDate}</td>

      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2 justify-end">
          <Link
            to={`/product/edit/${id}`}
            className={`px-3 py-1 text-xs rounded-full ${
              isDark
                ? "text-slate-100 bg-slate-700 hover:bg-slate-600"
                : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            }`}
          >
            Edit
          </Link>

          {loading ? (
            <div className="flex items-center justify-center w-12">
              <l-newtons-cradle size="24" speed="2.4" color="red"></l-newtons-cradle>
            </div>
          ) : (
            <button
            onClick={() => deleteProductBtn(product.id, product.name)}
              aria-label="Delete product"
              className={`px-3 py-1 text-xs rounded-full ${
                isDark
                  ? "text-red-200 bg-red-900/50 hover:bg-red-900"
                  : "text-red-700 bg-red-50 hover:bg-red-100"
              }`}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductDataList;
