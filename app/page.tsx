import React from "react";
import { getFeaturedProducts } from "@/lib/products-firestore";
import { getSiteContent } from "@/lib/content-firestore";
import HomeClient from "@/components/HomeClient";

export const revalidate = 0;

export default async function Home() {
  const [featuredProducts, content] = await Promise.all([
    getFeaturedProducts(),
    getSiteContent(),
  ]);

  return <HomeClient initialProducts={featuredProducts} content={content} />;
}


