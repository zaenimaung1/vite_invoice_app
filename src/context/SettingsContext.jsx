import React from "react";

const DEFAULT_SETTINGS = {
  shopName: "Voucher App",
  address: "",
  phoneNumber: "",
  taxPercent: 8,
  theme: "light",
  accentColor: "#4f46e5",
  language: "en",
};

const SettingsContext = React.createContext(null);

const TRANSLATIONS = {
  en: {
    settings: "Settings",
    settingsSubtitle: "Manage your store preferences and appearance.",
    backToDashboard: "Back to Dashboard",
    dashboard: "Dashboard",
    dashboardSubtitle: "Choose a module to get started managing your system.",
    modules: "Modules",
    overview: "Overview",
    totalProducts: "Total Products",
    todaySales: "Today Sales",
    todayRevenue: "Today Revenue",
    monthlyRevenue: "Monthly Revenue",
    todayProductShare: "Today Product Share",
    todayProductShareDesc: "Based on today's voucher items",
    chartType: "Chart Type",
    noSalesToday: "No sales recorded for today.",
    voucher: "Voucher",
    sale: "Sale",
    product: "Product",
    addSale: "Add Sale",
    voucherId: "Voucher ID",
    customerName: "Customer Name",
    phoneNumberLabel: "Phone Number",
    productLabel: "Product",
    quantityLabel: "Quantity",
    dateLabel: "Date",
    addSaleBtn: "Add Sale",
    confirmVoucher: "Confirm Voucher",
    noData: "There is no data",
    fullPrice: "Full Price",
    actions: "Actions",
    subtotal: "Subtotal",
    taxLabel: "Tax",
    grandTotal: "Grand Total",
    totalLabel: "Total",
    shopName: "Shop Name",
    address: "Address",
    phoneNumber: "Phone Number",
    taxPercent: "Tax Percentage",
    appearance: "Appearance",
    storeDetails: "Store Details",
    finance: "Finance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    accentColor: "Accent Color",
    language: "Language",
    english: "English",
    myanmar: "Myanmar",
    manageSettings: "Manage your store settings",
    home: "Home",
    productPageTitle: "Product Page",
    voucherModule: "Voucher Module",
    searchProducts: "Search products...",
    addProduct: "Add Product",
    priceLabel: "Price",
    createDate: "Create Date",
    noProductsFound: "No products found.",
    prev: "Prev",
    next: "Next",
    searchVouchers: "Search by voucher ID or customer name...",
    exportThisMonth: "Export This Month (Excel)",
    importVouchers: "Import Vouchers",
    voucherIdLabel: "Voucher ID",
    customerNameLabel: "Customer Name",
    productNameLabel: "Product Name",
    totalPriceLabel: "Total Price",
    dateLabelTable: "Date",
    actionLabel: "Action",
    loading: "Loading...",
    noVoucher: "There is no voucher to show.",
    noVouchersFound: "No vouchers found.",
    details: "Details",
    delete: "Delete",
    deleting: "Deleting...",
    voucherDetails: "Voucher Details",
    print: "Print",
    close: "Close",
    lineTotal: "Line Total",
    total: "Total",
    preview: "Preview",
  },
  my: {
    settings: "သတ်မှတ်ချက်များ", // More formal than ဆက်တင်
    settingsSubtitle: "လုပ်ငန်းဆိုင်ရာ အချက်အလက်နှင့် အပြင်အဆင်များကို စီမံရန်။",
    backToDashboard: "ပင်မစာမျက်နှာသို့",
    dashboard: "ပင်မစာမျက်နှာ",
    dashboardSubtitle: "လုပ်ငန်းဆောင်ရွက်ရန် ကဏ္ဍတစ်ခုကို ရွေးချယ်ပါ။",
    modules: "လုပ်ဆောင်ချက် ကဏ္ဍများ",
    overview: "ခြုံငုံသုံးသပ်ချက်",
    totalProducts: "စုစုပေါင်း ကုန်ပစ္စည်းအရေအတွက်",
    todaySales: "ယနေ့ အရောင်းမှတ်တမ်း",
    todayRevenue: "ယနေ့ ရရှိငွေ",
    monthlyRevenue: "လစဉ် ရရှိငွေ",
    todayProductShare: "ယနေ့ ကုန်ပစ္စည်းရောင်းချမှု အချိုးအစား",
    todayProductShareDesc: "ယနေ့ ဗောက်ချာများပေါ် အခြေခံထားသည်",
    chartType: "ပြဇယား အမျိုးအစား",
    noSalesToday: "ယနေ့အတွက် အရောင်းမှတ်တမ်း မရှိသေးပါ။",
    voucher: "ဗောက်ချာ",
    sale: "အရောင်း",
    product: "ကုန်ပစ္စည်း",
    addSale: "အရောင်းမှတ်တမ်းအသစ်",
    voucherId: "ဗောက်ချာ နံပါတ်",
    customerName: "ဝယ်ယူသူ အမည်",
    phoneNumberLabel: "ဖုန်းနံပါတ်",
    productLabel: "ကုန်ပစ္စည်း",
    quantityLabel: "အရေအတွက်",
    dateLabel: "ရက်စွဲ",
    addSaleBtn: "စာရင်းသွင်းရန်",
    confirmVoucher: "ဗောက်ချာ အတည်ပြုရန်",
    noData: "အချက်အလက် မရှိပါ",
    fullPrice: "ဈေးနှုန်း",
    actions: "ဆောင်ရွက်ချက်များ",
    subtotal: "စုစုပေါင်း (အသားတင်)",
    taxLabel: "အခွန်",
    grandTotal: "ကျသင့်ငွေ စုစုပေါင်း",
    totalLabel: "စုစုပေါင်း",
    shopName: "ဆိုင်/လုပ်ငန်း အမည်",
    address: "လိပ်စာ",
    phoneNumber: "ဆက်သွယ်ရန် ဖုန်းနံပါတ်",
    taxPercent: "အခွန် ရာခိုင်နှုန်း",
    appearance: "အပြင်အဆင်",
    storeDetails: "လုပ်ငန်းအချက်အလက်များ",
    finance: "ငွေကြေးဆိုင်ရာ",
    theme: "Display ပုံစံ",
    light: "အလင်း",
    dark: "အမှောင်",
    accentColor: "ပင်မ အရောင်",
    language: "ဘာသာစကား",
    english: "အင်္ဂလိပ် (English)",
    myanmar: "မြန်မာ (Myanmar)",
    manageSettings: "စနစ်ဆိုင်ရာ သတ်မှတ်ချက်များကို ပြင်ဆင်ရန်",
    home: "မူလစာမျက်နှာ",
    productPageTitle: "ကုန်ပစ္စည်း စာမျက်နှာ",
    voucherModule: "ဗော်ချာ မိုဂျူး",
    searchProducts: "ကုန်ပစ္စည်း ရှာရန်...",
    addProduct: "ကုန်ပစ္စည်း ထည့်ရန်",
    priceLabel: "ဈေးနှုန်း",
    createDate: "ဖန်တီးရက်",
    noProductsFound: "ကုန်ပစ္စည်း မတွေ့ပါ။",
    prev: "နောက်သို့",
    next: "ရှေ့သို့",
    searchVouchers: "ဗော်ချာ ID သို့မဟုတ် ဝယ်သူ အမည်ဖြင့် ရှာရန်...",
    exportThisMonth: "ယခုလ ထုတ်ယူရန် (Excel)",
    importVouchers: "ဗော်ချာများ တင်သွင်းရန်",
    voucherIdLabel: "ဗော်ချာ ID",
    customerNameLabel: "ဝယ်သူ အမည်",
    productNameLabel: "ကုန်ပစ္စည်း အမည်",
    totalPriceLabel: "စုစုပေါင်း ဈေးနှုန်း",
    dateLabelTable: "ရက်စွဲ",
    actionLabel: "လုပ်ဆောင်ချက်",
    loading: "တင်နေသည်...",
    noVoucher: "ပြသရန် ဗော်ချာ မရှိပါ။",
    noVouchersFound: "ဗော်ချာ မတွေ့ပါ။",
    details: "အသေးစိတ်",
    delete: "ဖျက်ရန်",
    deleting: "ဖျက်နေသည်...",
    voucherDetails: "ဗော်ချာ အသေးစိတ်",
    print: "ပရင့်ထုတ်ရန်",
    close: "ပိတ်ရန်",
    lineTotal: "လိုင်းစုစုပေါင်း",
    total: "စုစုပေါင်း",
    preview: "ကြိုတင်ကြည့်ရှုရန်",
  },
};

const getInitialSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = React.useState(getInitialSettings);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = settings.theme || "light";
    document.documentElement.lang = settings.language === "my" ? "my" : "en";
    document.documentElement.style.setProperty(
      "--accent-color",
      settings.accentColor || DEFAULT_SETTINGS.accentColor
    );
  }, [settings.theme, settings.accentColor, settings.language]);

  const updateSettings = React.useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const formatCurrency = React.useCallback(
    (value) => {
      const n = Number(value);
      const safe = Number.isFinite(n) ? n : 0;
      const label = settings.language === "my" ? "ကျပ်" : "MMK";
      return `${safe.toLocaleString("en-US")} ${label}`;
    },
    [settings.language]
  );

  const taxRate = React.useMemo(() => {
    const pct = Number(settings.taxPercent);
    return Number.isFinite(pct) ? pct / 100 : DEFAULT_SETTINGS.taxPercent / 100;
  }, [settings.taxPercent]);

  const t = React.useCallback(
    (key) =>
      TRANSLATIONS[settings.language]?.[key] ||
      TRANSLATIONS.en[key] ||
      key,
    [settings.language]
  );

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, formatCurrency, taxRate, t }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
};
