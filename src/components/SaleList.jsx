import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Container from "./Container";
import useSWR from "swr";
import useRecordStore from "../store/useRecordStroe";
import VoucherList from "./SaleTable";
import toast from "react-hot-toast";
import Select from "react-select";
import { useSettings } from "../context/SettingsContext.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

const SaleList = () => {
  const { taxRate, settings, t } = useSettings();
  const isDark = settings.theme === "dark";
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    control,
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
    const currentProduct = data.product?.value || data.product;
    if (!currentProduct) return;

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

    reset({ product: null, quantity: "", date: data.date });
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
    const tax = subTotal * taxRate;
    const grandTotal = subTotal + tax;

    const voucherJSON = {
      username: values.username,
      phoneNumber: values.phoneNumber,
      voucherId,
      date: new Date().toISOString(),
      items: records,
      subTotal,
      tax,
      taxRate: settings.taxPercent,
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

  const productOptions = React.useMemo(() => {
    return (data || []).map((product) => ({
      value: product,
      label: product.name,
    }));
  }, [data]);

  return (
    <Container>
      <section className="w-full">
        <div
          className={`rounded-xl shadow-sm border p-6 ${
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-gray-800"}`}>
            {t("addSale")}
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end"
          >
            {/* Voucher ID */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("voucherId")}
              </label>
              <input
                value={voucherId}
                readOnly
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("customerName")}
              </label>
              <input
                type="text"
                {...register("username", {
                  required: "Customer name is required",
                })}
                className={`border p-2 rounded w-full ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("phoneNumberLabel")}
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
                className={`border p-2 rounded w-full ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Product */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("productLabel")}
              </label>
              <Controller
              
                name="product"
                control={control}
                rules={{ required: "Product is required" }}
                render={({ field }) => (
                 <Select
  {...field}
  options={productOptions}
  isLoading={isLoading}
  placeholder={t("productLabel")}
  onChange={(option) => field.onChange(option)}
  value={field.value}
  menuPortalTarget={document.body}
  styles={{
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      borderColor: state.isFocused
        ? isDark
          ? "#475569"
          : "#6366f1"
        : isDark
        ? "#334155"
        : "#e5e7eb",
      boxShadow: state.isFocused
        ? isDark
          ? "0 0 0 2px rgba(71,85,105,0.4)"
          : "0 0 0 2px rgba(99,102,241,0.2)"
        : "none",
      color: isDark ? "#f1f5f9" : "#1f2937",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
        ? isDark
          ? "#1e293b"
          : "#eef2ff"
        : "transparent",
      color: state.isSelected
        ? "#ffffff"
        : isDark
        ? "#f1f5f9"
        : "#1f2937",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1f2937",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#9ca3af",
    }),
  }}
/>
                )}
              />
              {errors.product && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.product.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("quantityLabel")}
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: true,
                  min: 1,
                })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
            </div>

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {t("dateLabel")}
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                {...register("date", { required: true })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="lg:col-span-3 flex justify-end gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg accent-bg hover:opacity-90"
              >
                {t("addSaleBtn")}
              </button>

              <button
                type="button"
                onClick={confirmVoucher}
                disabled={records.length === 0}
                className={`px-4 py-2 rounded-lg text-white ${
                  records.length === 0
                    ? "bg-gray-400"
                    : "accent-bg hover:opacity-90"
                }`}
              >
                {t("confirmVoucher")}
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
