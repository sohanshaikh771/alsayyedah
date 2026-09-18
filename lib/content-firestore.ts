import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type SiteContent = {
  heroLabel: string;
  heroHeading: string;
  heroSubtext: string;
  heroBgImage?: string;
  categoriesTitle: string;
  featuredTitle: string;
  storyLabel: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyTagline: string;
};

export const defaultContent: SiteContent = {
  heroLabel: "MODEST FASHION",
  heroHeading: "Your Modest\nIdentity",
  heroSubtext: "Premium Burkha, Abaya, Niqab & Hijab — handcrafted with love, delivered across India.",
  categoriesTitle: "Shop by Category",
  featuredTitle: "Featured Products",
  storyLabel: "OUR STORY",
  storyHeading: "ALSayyedah",
  storyParagraph1: "At ALSayyedah, modesty and elegance exist in graceful harmony, inspired by timeless Islamic heritage, each garment is designed to celebrate your personal expression of faith with quiet luxury and uncompromising dignity.",
  storyParagraph2: "From hand-selected breathable Saudi Crepe and Korean Nida fabrics to impeccably tailored cuts, we pour artisan craftsmanship into every stitch. Designed for comfort and lasting grace, delivered straight to your doorstep across India.",
  storyTagline: "Your Modest Identity",
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const snap = await getDoc(doc(db, "content", "homepage"));
    if (!snap.exists()) return defaultContent;
    return { ...defaultContent, ...snap.data() } as SiteContent;
  } catch (err) {
    console.warn("Failed to get site content from Firestore, using defaults:", err);
    return defaultContent;
  }
}

export async function updateSiteContent(data: Partial<SiteContent>) {
  await setDoc(doc(db, "content", "homepage"), data, { merge: true });
}
