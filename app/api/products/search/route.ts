import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        images: true,
        variants: true,
      },
      take: 20,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products/search error:", error);

    return NextResponse.json(
      { message: "Failed to search products" },
      { status: 500 }
    );
  }
}