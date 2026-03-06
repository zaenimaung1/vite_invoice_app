import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";

const CreateProductList = () => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";

  const onSubmit = async (data) => {
    setIsLoading(true);
    const created_at = new Date().toISOString();

    // POST request without stock
    await fetch(import.meta.env.VITE_API_URL + "/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        price: Number(data.price), // already in MMK
        created_at,
      }),
    });

    setIsLoading(false);
    reset();

    if (data.back) {
      navigate("/product");
    }

    toast.success(`${data.name} created successfully!`);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6">
      <Toaster />
      <h2 className={`text-xl font-semibold mb-1 ${isDark ? "text-[#F5F5F5]" : "text-gray-800"}`}>Create New Product</h2>
      <p className={`text-sm mb-6 ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
        Fill in the details below to create a new product.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>Product Name</label>
          <input
            type="text"
            {...register("name", { required: true, minLength: 3, maxLength: 50 })}
            placeholder="Enter product name..."
            className={`w-full px-3 py-2 border rounded-lg outline-none ${
              errors.name ? "border-red-500 focus:ring-2 focus:ring-red-400" : "accent-ring"
            } ${isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5] placeholder:text-[#71717A]" : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">
              Product name is required (3-50 characters).
            </p>
          )}
        </div>

        {/* Price in MMK */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>Price (MMK)</label>
          <input
            type="number"
            {...register("price", { required: true, min: 100, max: 1000000 })}
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-lg outline-none ${
              errors.price ? "border-red-500 focus:ring-2 focus:ring-red-400" : "accent-ring"
            } ${isDark ? "bg-[#1E1F23] border-[#3F3F46] text-[#F5F5F5] placeholder:text-[#71717A]" : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"}`}
          />
          {errors.price && (
            <p className="text-xs text-red-500 mt-1">
              Price is required (100 - 1,000,000 MMK).
            </p>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("confirm_details", { required: true })}
            className="w-4 h-4 cursor-pointer"
          />
          <label className={`text-sm font-medium ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>
            Make sure all fields are correct
          </label>
        </div>

        {/* Back Checkbox */}
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("back")} className="w-4 h-4 cursor-pointer" />
          <label className={`text-sm font-medium ${isDark ? "text-[#A1A1AA]" : "text-gray-700"}`}>Back to Product Page</label>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className={`w-full py-2 border rounded-lg transition ${
              isDark ? "border-[#3F3F46] text-[#F5F5F5] hover:bg-[#32353D]" : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 accent-bg text-white rounded-lg transition ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isLoading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductList;
