import React from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import useSWR from "swr";
import { useSettings } from "../context/SettingsContext.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());
const EditProductList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";

  // Fetch product
  const { data, error, isLoading } = useSWR(
    import.meta.env.VITE_API_URL + "/products/" + id,fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  

  const onSubmit = async ( data) => {
    await fetch(import.meta.env.VITE_API_URL + "/products/"+id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        price: data.price,
        created_at: new Date().toISOString()
      })
    });

    if (data.back) {
      navigate("/product/");
    }
  };


  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6">
      <h2 className={`text-xl font-semibold mb-1 ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>Edit Product</h2>
      <p className={`text-sm mb-6 ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
        Update the information below.
      </p>

      {isLoading ? (
        <p>Loading...</p>
      ) : <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>Product Name</label>
          <input
            type="text"
            defaultValue={data.name}
            {...register("name", { required: true, minLength: 3 })}
            className={`w-full px-3 py-2 border rounded-lg accent-ring ${
              isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5]" : "bg-white border-gray-200 text-gray-800"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500">Product name is required.</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>Price</label>
          <input
            type="number"
            defaultValue={data.price}
            {...register("price", { required: true, min: 100 })}
            className={`w-full px-3 py-2 border rounded-lg accent-ring ${
              isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5]" : "bg-white border-gray-200 text-gray-800"
            }`}
          />
        </div>

      

        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input type="checkbox" checked {...register("back")} className="w-4 h-4" />
          <label className={isDark ? "text-[#A1A1AA]" : "text-gray-700"}>Back to Product Page after editing</label>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => reset(data)}
            className={`py-2 border rounded-lg ${
              isDark ? "border-[#3F3F46] text-[#F5F5F5] hover:bg-[#32353D]" : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 accent-bg text-white rounded-lg hover:opacity-90"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>}
    </div>
  );
};

export default EditProductList;
