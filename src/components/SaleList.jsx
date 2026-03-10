import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR, { useSWRConfig } from "swr";
import useRecordStore from "../store/useRecordStroe";
import VoucherList from "./SaleTable";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Select from "react-select";
import { useSettings } from "../context/SettingsContext.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

const SaleList = () => {
  const { taxRate, settings, t } = useSettings();
  const isDark = settings.theme === "dark";
  const { mutate } = useSWRConfig();
  const todayStr = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    control,
  } = useForm({
    defaultValues: { date: todayStr },
  });

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
    const sanitizedItems = records.map((rec) => {
      const prod = rec.product || {};
      return {
        ...rec,
        product: {
          id: prod.id,
          name: prod.name,
          price: prod.price,
          created_at: prod.created_at,
        },
      };
    });

    const voucherJSON = {
      username: values.username,
      phoneNumber: values.phoneNumber,
      voucherId,
      date: new Date().toISOString(),
      items: sanitizedItems,
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
      Swal.fire({
        icon: "success",
        title: "Voucher confirmed",
        text: "Your voucher has been saved.",
        timer: 1800,
        showConfirmButton: false,
      });

      resetRecords();
      reset();
      mutate(import.meta.env.VITE_API_URL + "/vouchers");
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
      <section className="w-full">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            {t("addSale")}
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end"
          >
            {/* Voucher ID */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {t("voucherId")}
              </label>
              <input
                value={voucherId}
                readOnly
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 accent-ring"
                style={{ borderColor: "var(--card-border)", background: "var(--card-muted)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {t("customerName")}
              </label>
              <input
                type="text"
                {...register("username", {
                  required: "Customer name is required",
                })}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 accent-ring"
                style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
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
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 accent-ring"
                style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
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
      backgroundColor: isDark ? "#2A2D34" : "#ffffff",
      borderColor: state.isFocused
        ? isDark
          ? "#A3E635"
          : "#A3E635"
        : isDark
        ? "#3F3F46"
        : "#e5e7eb",
      boxShadow: state.isFocused
        ? isDark
          ? "0 0 0 2px rgba(163, 230, 53, 0.35)"
          : "0 0 0 2px rgba(163, 230, 53, 0.2)"
        : "none",
      color: isDark ? "#F5F5F5" : "#1f2937",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2A2D34" : "#ffffff",
      border: isDark ? "1px solid #3F3F46" : "1px solid #e5e7eb",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A3E635"
        : state.isFocused
        ? isDark
          ? "#32353D"
          : "rgba(163, 230, 53, 0.15)"
        : "transparent",
      color: state.isSelected
        ? "#1E1F23"
        : isDark
        ? "#F5F5F5"
        : "#1f2937",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#F5F5F5" : "#1f2937",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#F5F5F5" : "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#71717A" : "#9ca3af",
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
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {t("quantityLabel")}
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: true,
                  min: 1,
                })}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 accent-ring"
                style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {t("dateLabel")}
              </label>
              <input
                type="date"
                value={todayStr}
                disabled
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 accent-ring"
                style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
              />
              <input type="hidden" {...register("date", { required: true })} value={todayStr} />
            </div>

            {/* Buttons */}
            <div className="lg:col-span-3 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                {t("addSaleBtn")}
              </button>

              <button
                type="button"
                onClick={confirmVoucher}
                disabled={records.length === 0}
                className={`btn w-full sm:w-auto cursor-not-allowed ${
                  records.length === 0 ? "btn-ghost opacity-60 cursor-not-allowed" : "btn-primary"
                }`}
              >
                {t("confirmVoucher")}
              </button>
            </div>
          </form>
        </div>

        <VoucherList />
      </section>
  );
};

export default SaleList;
