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
  const { id, name, price, standardProfit, created_at } = product;

  // Format date (en-GB style)
  const date = new Date(created_at);
  const formattedDate = date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatPrice = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? formatCurrency(n) : "-";
  };

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
    <tr className={isDark ? "hover:bg-[#32353D]" : "hover:bg-gray-50"}>
      <td className={`px-3 sm:px-4 py-4 text-sm ${isDark ? "text-[#A1A1AA]" : "text-gray-600"}`}>{id}</td>

      <td className="px-3 sm:px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-md shrink-0 ${isDark ? "bg-[#2A2D34]" : "bg-gray-100"}`} />
          <div className="min-w-0">
            <div className={`font-medium truncate ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>{name}</div>
            <div className={`text-sm ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{t("productLabel")}</div>
          </div>
        </div>
      </td>

      <td className={`px-3 sm:px-4 py-4 text-right font-medium whitespace-nowrap ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>
        {formatPrice(price)}
      </td>

      <td className={`px-3 sm:px-4 py-4 text-right font-medium whitespace-nowrap ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>
        {formatPrice(standardProfit)}
      </td>

      <td className={`px-3 sm:px-4 py-4 text-sm whitespace-nowrap ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>{formattedDate}</td>

      <td className="px-3 sm:px-4 py-4 text-right">
        <div className="inline-flex flex-wrap items-center gap-2 justify-end">
          <Link
            to={`/product/edit/${id}`}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-full ${
              isDark
                ? "text-[#F5F5F5] bg-[#32353D] hover:bg-[#3F3F46]"
                : "text-[#1E1F23] bg-[#A3E635] hover:bg-[#B6F542]"
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
              className={`px-2.5 sm:px-3 py-1 text-xs rounded-full ${
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
