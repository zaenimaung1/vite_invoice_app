import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Container from "./Container";
import useSWR from "swr";
import useRecordStore from "../store/useRecordStroe";
import VoucherList from "./SaleTable";
import VoucherTableRow from "./VoucherTableRow";

const fetcher = (url) => fetch(url).then((res) => res.json());
const SaleList = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { data, error, isLoading } = useSWR(
    import.meta.env.VITE_API_URL + "/products",
    fetcher
  );

  const { addRecord, records, changeQuantity ,resetRecords } = useRecordStore();

  const onSubmit = (data) => {
    const currentProduct = JSON.parse(data.product);
    const currentProductId = records.find(
      (rec) => rec.product.id === currentProduct.id
    );
    if (currentProductId) {
      const newQty = currentProductId.quantity + Number(data.quantity);
      changeQuantity(currentProductId.id, newQty);
      reset();
      return;
    } else {
      addRecord({
        id: Date.now(),
        product: currentProduct,
        quantity: Number(data.quantity),
        cost: Number(currentProduct.price) * Number(data.quantity),
        created_at: new Date().toISOString(),
      });
      reset();
    }
  };
  const [voucherId] = useState(
    () => "V-" + Math.random().toString(36).substring(2, 7).toUpperCase()
  );
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

 const confirmVoucher = async () => {
  if (!username || !phoneNumber) {
    alert("Please enter username and phone number.");
    return;
  }

  if (records.length === 0) {
    alert("You must add at least one product.");
    return;
  }

  const subTotal = records.reduce((sum, rec) => sum + rec.cost, 0);
  const tax = subTotal * 0.08;
  const grandTotal = subTotal + tax;

  const voucherJSON = {
    username,
    phoneNumber,
    voucherId,
    date: new Date().toISOString().slice(0, 10),
    items: records,
    subTotal,
    tax,
    grandTotal,
  };

  try {
    const res = await fetch(import.meta.env.VITE_API_URL + "/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voucherJSON),
    });

    if (!res.ok) throw new Error("Failed to save voucher");

    alert("Voucher Confirmed!");

    // Clear records
    resetRecords();

    setUsername("");
    setPhoneNumber("");

  } catch (error) {
    console.error("Error saving voucher:", error);
    alert("Error saving voucher");
  }
};



  return (
    <Container>
      <section className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add Sale</h3>
              <p className="text-sm text-gray-500 mt-1">
                Quickly add a new sale — works responsively across screen sizes.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Recent sales:{" "}
                <span className="font-semibold text-gray-800">
                  {records.length}
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Voucher ID
              </label>
              <input
                defaultValue={voucherId}
                readOnly
                {...register("vocherId", { required: true, minLength: 2 })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.vocherId
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-200 focus:ring-indigo-300"
                }`}
                placeholder="e.g. V-001"
              />
              {errors.vocherId && (
                <p className="text-xs text-red-500 mt-1">
                  Voucher ID is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Customer name
              </label>
              <input
                type="text"
                placeholder="Customer Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                 Phone Number
              </label>
              <input
                type="number"
                placeholder="Customer Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                {...register("product", { required: true })}
                name="product"
                id="product"
                className="w-full px-3 py-2 rounded-lg text-gray-500 border focus:outline-none focus:ring-2 border-gray-200 focus:ring-indigo-300"
              >
                <option value="">Select product</option>
                {!isLoading &&
                  data.map((product) => (
                    <option key={product.id} value={JSON.stringify(product)}>
                      {product.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                {...register("quantity", { required: true })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.quantity
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-200 focus:ring-indigo-300"
                }`}
                placeholder="Add quantity"
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-1">
                  Quantity is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                defaultValue={new Date().toISOString().slice(0, 10)}
                {...register("date", { required: true })}
                type="date"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-200 focus:ring-indigo-300"
                }`}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">Date is required</p>
              )}
            </div>

            <div className="lg:col-span-3 flex items-center justify-end gap-3">
              <button
                type="reset"
                onClick={() => reset()}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Sale
              </button>
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={confirmVoucher}
                disabled={records.length === 0}
                className={`px-4 py-2 rounded-lg text-white 
      ${
        records.length === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }
    `}
              >
                Confirm Voucher
              </button>
            </div>
          </form>
        </div>

        {/* Recent sales table */}
        <VoucherList />
      </section>
    </Container>
  );
};

export default SaleList;
