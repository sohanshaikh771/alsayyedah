export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  instagramUrl: string;
  whatsappNumber: string;
  facebookUrl: string;
  freeShippingAbove: number;
  shippingCharge: number;
  codCharge: number;
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "ALSayyedah",
  tagline: "Your Modest Identity",
  phone: "+91 99258 37795",
  email: "support@alsayyedah.us.ci",
  instagramUrl: "https://www.instagram.com/alsayyedah.us.ci/",
  whatsappNumber: "919925837795",
  facebookUrl: "",
  freeShippingAbove: 1999,
  shippingCharge: 99,
  codCharge: 49,
};

export const BRAND = {
  name: "ALSayyedah",
  tagline: "Your Modest Identity",
  whatsapp: "919925837795",
  whatsappLink: "https://wa.me/919925837795",
  instagramHandle: "@alsayyedah.us.ci",
  instagramUrl: "https://www.instagram.com/alsayyedah.us.ci/",
  phone: "+91 99258 37795",
  email: "support@alsayyedah.us.ci",
  freeShippingAbove: 1999,
  shippingCharge: 99,
  codCharge: 49,
} as const;

export function getDynamicBrand(settings?: Partial<StoreSettings>) {
  const s = { ...defaultStoreSettings, ...settings };
  return {
    name: s.storeName,
    tagline: s.tagline,
    whatsapp: s.whatsappNumber,
    whatsappLink: `https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}`,
    instagramHandle: "@alsayyedah.us.ci",
    instagramUrl: s.instagramUrl,
    phone: s.phone,
    email: s.email,
    freeShippingAbove: s.freeShippingAbove,
    shippingCharge: s.shippingCharge,
    codCharge: s.codCharge,
  };
}
