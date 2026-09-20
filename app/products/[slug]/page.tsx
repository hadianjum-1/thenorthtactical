import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetails from "./ProductDetails";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  if (!product) return {};

  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetails slug={slug} />;
}
