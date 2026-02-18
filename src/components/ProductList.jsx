import React from "react";
import useSWR from "swr";
import ProductDataList from "./ProductDataList";
import SkeletonData from "./SkeletonData";
import { Link } from "react-router";
// (Link not used here) keep imports minimal


const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductList = () => {

  const {data , error , isLoading} = useSWR(import.meta.env.VITE_API_URL + '/products', fetcher);

 
  
  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      
        <div className="flex items-center gap-2">
          <label className="relative block">
            <input
              className="placeholder:italic placeholder:text-sm placeholder:text-gray-400 border border-gray-200 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Search products..."
              aria-label="Search products"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">⌕</span>
          </label>

          
        </div>
        <div>
          <Link to="/product/create" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300">
            + Add Product
          </Link>
        </div>
      </div>
      { isLoading && <SkeletonData /> }

      {!isLoading && (
        <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-gray-700 table-fixed">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th scope="col" className="w-12 px-4 py-3">#</th>
                <th scope="col" className="px-4 py-3 text-left">Product</th>
                <th scope="col" className="w-28 px-4 py-3 text-right">Price</th>
                <th scope="col" className="w-20 px-4 py-3 text-right">Stock</th>
                <th scope="col" className="w-28 px-4 py-3 text-right">Create Date</th>
                <th scope="col" className="w-48 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((product) => (
                  <ProductDataList key={product.id} product={product} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
    </div>
  );
};

export default ProductList;
