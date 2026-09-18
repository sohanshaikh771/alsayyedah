import React from "react";
import { getFeaturedProducts, getAllProducts, Product } from "@/lib/products-firestore";
import { getSiteContent } from "@/lib/content-firestore";
import HomeClient from "@/components/HomeClient";

export const revalidate = 0;

export default async function Home() {
  const [featured, content] = await Promise.all([
    getFeaturedProducts(),
    getSiteContent(),
  ]);

  let products: Product[] = featured;
  if (products.length < 3) {
    const all = await getAllProducts();
    const existingIds = new Set(products.map((p) => p.id));
    const additional = all.filter((p) => !existingIds.has(p.id));
    products = [...products, ...additional];
  }

  const initialProducts = products.slice(0, 8);

  return <HomeClient initialProducts={initialProducts} content={content} />;
}


