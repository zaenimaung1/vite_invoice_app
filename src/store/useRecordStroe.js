import { create } from "zustand";

const useRecordStore = create((set) => ({
  records: [],

  addRecord: (record) =>
    set((state) => ({
      records: [...state.records, record],
    })),

  removeRecord: (recordId) =>
    set((state) => ({
      records: state.records.filter((rec) => rec.id !== recordId),
    })),

  changeQuantity: (recordId, newQty) =>
    set((state) => ({
      records: state.records.map((rec) => {
        if (rec.id === recordId) {
          const price = Number(rec.product.price); // Safe conversion
          const updatedCost = price * newQty;

          return {
            ...rec,
            quantity: newQty,
            cost: updatedCost,
          };
        }
        return rec;
      }),
    })),

  resetRecords: () => set({ records: [] }),
}));

export default useRecordStore;
