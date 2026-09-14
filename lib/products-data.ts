export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "abaya" | "burkha" | "niqab" | "hijab";
  price: number;
  mrp?: number;
  fabric: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "noor-abaya",
    name: "Noor Abaya",
    category: "abaya",
    price: 1899,
    mrp: 2499,
    fabric: "Korean Nida",
    description:
      "An elegantly draped luxury abaya crafted from premium Korean Nida fabric, designed for seamless modesty and timeless elegance.",
    images: ["/products/noor-abaya-1.jpg", "/products/noor-abaya-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige", "Taupe"],
    stock: 25,
    featured: true,
  },
  {
    id: "2",
    slug: "sahar-abaya",
    name: "Sahar Abaya",
    category: "abaya",
    price: 2199,
    mrp: 2899,
    fabric: "Saudi Crepe",
    description:
      "A sophisticated silhouette featuring subtle detailing, tailored with high-grade breathable Saudi Crepe for special occasions.",
    images: ["/products/sahar-abaya-1.jpg", "/products/sahar-abaya-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Taupe", "Sand"],
    stock: 18,
    featured: true,
  },
  {
    id: "3",
    slug: "haya-burkha",
    name: "Haya Burkha",
    category: "burkha",
    price: 1499,
    mrp: 1999,
    fabric: "Saudi Crepe",
    description:
      "Classic Burkha designed for supreme modesty, comfort, and dignified flowing drape for everyday grace.",
    images: ["/products/haya-burkha-1.jpg", "/products/haya-burkha-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    stock: 30,
    featured: true,
  },
  {
    id: "4",
    slug: "safa-burkha",
    name: "Safa Burkha",
    category: "burkha",
    price: 1699,
    fabric: "Saudi Crepe",
    description:
      "Lightweight and versatile burkha tailored from smooth Saudi Crepe for effortless coverage and daily wear.",
    images: ["/products/safa-burkha-1.jpg", "/products/safa-burkha-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    stock: 15,
    featured: false,
  },
  {
    id: "5",
    slug: "sitara-niqab",
    name: "Sitara Niqab",
    category: "niqab",
    price: 499,
    fabric: "Chiffon",
    description:
      "Ultra-breathable chiffon niqab crafted for all-day breathability, comfort, and flawless coverage.",
    images: ["/products/sitara-niqab-1.jpg", "/products/sitara-niqab-2.jpg"],
    sizes: ["Free Size"],
    colors: ["Black", "Taupe"],
    stock: 50,
    featured: false,
  },
  {
    id: "6",
    slug: "rida-niqab",
    name: "Rida Niqab",
    category: "niqab",
    price: 599,
    fabric: "Jersey",
    description:
      "Soft stretch premium jersey niqab designed for exceptional softness against the skin and a secure fit.",
    images: ["/products/rida-niqab-1.jpg", "/products/rida-niqab-2.jpg"],
    sizes: ["Free Size"],
    colors: ["Black", "Sand"],
    stock: 40,
    featured: false,
  },
  {
    id: "7",
    slug: "aara-hijab",
    name: "Aara Hijab",
    category: "hijab",
    price: 399,
    mrp: 599,
    fabric: "Jersey",
    description:
      "Premium four-way stretch jersey hijab that drapes effortlessly without slippage, requiring no pins.",
    images: ["/products/aara-hijab-1.jpg", "/products/aara-hijab-2.jpg"],
    sizes: ["Free Size"],
    colors: ["Beige", "Sand", "Taupe", "Black"],
    stock: 60,
    featured: true,
  },
  {
    id: "8",
    slug: "meher-hijab",
    name: "Meher Hijab",
    category: "hijab",
    price: 449,
    fabric: "Chiffon",
    description:
      "Delicate airy textured chiffon hijab offering a lightweight, elegant drape for timeless modesty.",
    images: ["/products/meher-hijab-1.jpg", "/products/meher-hijab-2.jpg"],
    sizes: ["Free Size"],
    colors: ["Beige", "Sand", "Taupe", "Black"],
    stock: 45,
    featured: false,
  },
];
