import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const inStockOnly = searchParams.get("inStock") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    if (featuredOnly) {
      where.featured = true;
    }

    if (inStockOnly) {
      where.variants = {
        some: {
          stock: { gt: 0 },
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "title") {
      orderBy = { title: "asc" };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy,
    });

    // Client/variant-level price sorting if requested
    const sortedProducts = [...products];
    if (sort === "price-asc") {
      sortedProducts.sort((a, b) => {
        const pA = a.variants?.[0]?.price ?? 0;
        const pB = b.variants?.[0]?.price ?? 0;
        return pA - pB;
      });
    } else if (sort === "price-desc") {
      sortedProducts.sort((a, b) => {
        const pA = a.variants?.[0]?.price ?? 0;
        const pB = b.variants?.[0]?.price ?? 0;
        return pB - pA;
      });
    }

    return NextResponse.json({
      success: true,
      products: sortedProducts,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}