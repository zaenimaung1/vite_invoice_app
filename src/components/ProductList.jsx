import React from "react";
import useSWR from "swr";
import ProductDataList from "./ProductDataList";
import SkeletonData from "./SkeletonData";
import { Link } from "react-router";
import { useSettings } from "../context/SettingsContext.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

import { useState, useMemo } from "react";

const ProductList = () => {
  const { settings, t } = useSettings();
  const isDark = settings.theme === "dark";
  const { data, isLoading } = useSWR(import.meta.env.VITE_API_URL + "/products", fetcher);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!search.trim()) return data;
    return data.filter((product) =>
      product.name && product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="relative block">
            <input
              className={`placeholder:italic placeholder:text-sm border rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 accent-ring ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
                  : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"
              }`}
              placeholder={t("searchProducts")}
              aria-label={t("searchProducts")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                isDark ? "text-slate-400" : "text-gray-400"
              }`}
            >
              x
            </span>
          </label>
        </div>
        <div>
          <Link
            to="/product/create"
            className="inline-flex items-center gap-2 text-white text-sm font-medium px-3 py-2 rounded-md shadow-sm accent-bg hover:opacity-90 accent-ring"
          >
            + {t("addProduct")}
          </Link>
        </div>
      </div>

      {isLoading && <SkeletonData />}

      {!isLoading && (
        <>
          <div
            className={`relative overflow-x-auto rounded-lg border shadow-sm ${
              isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
            }`}
          >
            <table
              className={`w-full text-sm text-left table-fixed ${
                isDark ? "text-slate-200" : "text-gray-700"
              }`}
            >
              <thead
                className={`text-xs uppercase tracking-wide ${
                  isDark ? "bg-slate-800 text-slate-400" : "bg-gray-50 text-gray-500"
                }`}
              >
                <tr>
                  <th scope="col" className="w-12 px-4 py-3">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    {t("productLabel")}
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    {t("priceLabel")}
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    {t("createDate")}
                  </th>
                  <th scope="col" className="w-48 px-4 py-3 text-right">
                    {t("actions")}
                  </th>
                </tr>
              </thead>

              <tbody className={`${isDark ? "divide-slate-800" : "divide-gray-100"} divide-y`}>
                {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                  paginatedData.map((product) => (
                    <ProductDataList key={product.id} product={product} />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-4 py-6 text-center text-sm ${
                        isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      {t("noProductsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
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
        </>
      )}
    </div>
  );
};

export default ProductList;
