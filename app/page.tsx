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

  let productsToShow = [...featured];

  if (productsToShow.length < 4) {
    const all = await getAllProducts();
    const featuredIds = new Set(featured.map((p) => p.id));
    const others = all.filter((p) => !featuredIds.has(p.id));
    productsToShow = [...featured, ...others].slice(0, 8);
  }

  const initialProducts = productsToShow.slice(0, 8);

  return <HomeClient initialProducts={initialProducts} content={content} />;
}


