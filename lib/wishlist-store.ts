import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
};

export type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalItems: () => number;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state;
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      toggleItem: (item) => {
        const isPresent = get().isInWishlist(item.productId);
        if (isPresent) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),

      totalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: "alsayyedah-wishlist",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        items: state.items,
      }) as unknown as WishlistStore,
    }
  )
);
