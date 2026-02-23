import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Container from "./Container";
import useSWR from "swr";
import useRecordStore from "../store/useRecordStroe";
import VoucherList from "./SaleTable";
import toast from "react-hot-toast";

const fetcher = (url) => fetch(url).then((res) => res.json());

const SaleList = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm();

  const { data, isLoading } = useSWR(
    import.meta.env.VITE_API_URL + "/products",
    fetcher
  );

  const { addRecord, records, changeQuantity, resetRecords } =
    useRecordStore();

  const [voucherId] = useState(
    () => "V-" + Math.random().toString(36).substring(2, 7).toUpperCase()
  );

  const onSubmit = (data) => {
    const currentProduct = JSON.parse(data.product);

    const existing = records.find(
      (rec) => rec.product.id === currentProduct.id
    );

    if (existing) {
      const newQty = existing.quantity + Number(data.quantity);
      changeQuantity(existing.id, newQty);
    } else {
      addRecord({
        id: Date.now(),
        product: currentProduct,
        quantity: Number(data.quantity),
        cost: Number(currentProduct.price) * Number(data.quantity),
        created_at: new Date().toISOString(),
      });
    }

    reset({ product: "", quantity: "", date: data.date });
  };

  const confirmVoucher = async () => {
    const values = getValues();

    const phoneRegex = /^09\d{5,9}$/;

    if (!values.username || !values.phoneNumber) {
      toast.error("Please enter username and phone number.");
      return;
    }

    if (!phoneRegex.test(values.phoneNumber)) {
      toast.error("Phone number must start with 09 and be between 7 and 11 digits.");
      return;
    }

    if (records.length === 0) {
      toast.error("You must add at least one product.");
      return;
    }

    const subTotal = records.reduce((sum, rec) => sum + rec.cost, 0);
    const tax = subTotal * 0.08;
    const grandTotal = subTotal + tax;

    const voucherJSON = {
      username: values.username,
      phoneNumber: values.phoneNumber,
      voucherId,
      date: new Date().toISOString(),
      items: records,
      subTotal,
      tax,
      grandTotal,
    };

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/vouchers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(voucherJSON),
        }
      );

      if (!res.ok) throw new Error("Failed to save voucher");

      toast.success("Voucher confirmed!");

      resetRecords();
      reset();
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast.error("Error saving voucher");
    }
  };

  return (
    <Container>
      <section className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add Sale
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end"
          >
            {/* Voucher ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Voucher ID
              </label>
              <input
                value={voucherId}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                {...register("username", {
                  required: "Customer name is required",
                })}
                className="border p-2 rounded w-full"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                maxLength={11}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^09\d{5,9}$/,
                    message:
                      "Phone must start with 09 and be 7-11 digits",
                  },
                })}
                className="border p-2 rounded w-full"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product
              </label>
              <select
                {...register("product", { required: true })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              >
                <option value="">Select product</option>
                {!isLoading &&
                  data?.map((product) => (
                    <option
                      key={product.id}
                      value={JSON.stringify(product)}
                    >
                      {product.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: true,
                  min: 1,
                })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                {...register("date", { required: true })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200"
              />
            </div>

            {/* Buttons */}
            <div className="lg:col-span-3 flex justify-end gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Add Sale
              </button>

              <button
                type="button"
                onClick={confirmVoucher}
                disabled={records.length === 0}
                className={`px-4 py-2 rounded-lg text-white ${
                  records.length === 0
                    ? "bg-gray-400"
                    : "bg-green-600"
                }`}
              >
                Confirm Voucher
              </button>
            </div>
          </form>
        </div>

        <VoucherList />
      </section>
    </Container>
  );
};

export default SaleList;
