import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateProductList = () => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="w-full max-w-xl p-6">
      <Toaster />
      <h2 className="text-xl font-semibold mb-1">Create New Product</h2>
      <p className="text-sm text-gray-500 mb-6">
        Fill in the details below to create a new product.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            {...register("name", { required: true, minLength: 3, maxLength: 50 })}
            placeholder="Enter product name..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
              errors.name ? "focus:ring-red-400 border-red-500" : "focus:ring-blue-400"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">
              Product name is required (3-50 characters).
            </p>
          )}
        </div>

        {/* Price in MMK */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (MMK)</label>
          <input
            type="number"
            {...register("price", { required: true, min: 100, max: 1000000 })}
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
              errors.price ? "focus:ring-red-400 border-red-500" : "focus:ring-blue-400"
            }`}
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
          <label className="text-sm font-medium">
            Make sure all fields are correct
          </label>
        </div>

        {/* Back Checkbox */}
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("back")} className="w-4 h-4 cursor-pointer" />
          <label className="text-sm font-medium">Back to Product Page</label>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2 border-black border text-black rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 bg-blue-600 text-white rounded-lg transition ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
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
