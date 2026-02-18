import React, { useState } from 'react'
import { useSWRConfig } from 'swr';
import { newtonsCradle } from 'ldrs'
import toast from 'react-hot-toast';
import { Link } from 'react-router';

newtonsCradle.register()

const ProductDataList = ({ product = {} }) => {
  const { id, name, price, created_at, stock } = product;

  const date = new Date(created_at);
  const formattedDate = date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const deleteProductBtn = async () => {
    setLoading(true);

    await fetch(import.meta.env.VITE_API_URL + `/products/${id}`, {
      method: 'DELETE'
    });

    mutate(import.meta.env.VITE_API_URL + '/products');
    setLoading(false);
    toast.success(`${name} deleted successfully!`);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-gray-600">{id}</td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0" />
          <div>
            <div className="font-medium text-gray-800">{name}</div>
            <div className="text-sm text-gray-500">Product</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-right font-medium text-gray-800">
        {price ? `$ ${Number(price).toLocaleString()}` : "-"}
      </td>

      <td className="px-4 py-4 text-right text-sm text-gray-600">{typeof stock === 'number' ? stock : '-'}</td>

      <td className="px-4 py-4 text-sm text-gray-500">{formattedDate}</td>

      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2 justify-end">
          <Link to={`/product/edit/${id}`} className="px-3 py-1 text-xs text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100">
            Edit
          </Link>

          {loading ? (
      <div className="flex items-center justify-center w-12">
        <l-newtons-cradle size="24" speed="2.4" color="red"></l-newtons-cradle>
      </div>
    ) : (
      <button
        onClick={deleteProductBtn}
        aria-label="Delete product"
        className="px-3 py-1 text-xs text-red-700 bg-red-50 rounded-full hover:bg-red-100"
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
