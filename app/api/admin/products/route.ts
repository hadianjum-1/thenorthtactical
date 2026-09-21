import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "STAFF"
  ) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      slug,
      description,
      categoryId,
      price,
      compareAtPrice,
      sku,
      stock,
      imageUrl,
      images,
      status,
      featured,
    } = body;

    if (!title || !slug || !description || !sku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, slug, description and SKU are required.",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Price is required.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const existingSku = await prisma.productVariant.findUnique({
      where: {
        sku,
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    // Prepare images data
    let imageCreateData: { url: string; alt: string; sortOrder: number }[] = [];
    if (Array.isArray(images) && images.length > 0) {
      imageCreateData = images
        .filter(
          (img: any) =>
            img && typeof img.url === "string" && img.url.trim().length > 0
        )
        .map((img: any, index: number) => ({
          url: String(img.url).trim(),
          alt: String(img.alt || title).trim(),
          sortOrder:
            typeof img.sortOrder === "number" ? img.sortOrder : index,
        }));
    } else if (imageUrl) {
      imageCreateData = [
        {
          url: String(imageUrl).trim(),
          alt: String(title).trim(),
          sortOrder: 0,
        },
      ];
    }

    const product = await prisma.product.create({
      data: {
        title: String(title).trim(),
        slug: String(slug).trim().toLowerCase(),
        description: String(description).trim(),
        categoryId: categoryId || null,
        status: status || "DRAFT",
        featured: Boolean(featured),

        variants: {
          create: {
            title: "Default",
            sku: String(sku).trim(),
            price: Number(price),
            compareAtPrice:
              compareAtPrice !== undefined &&
              compareAtPrice !== null &&
              compareAtPrice !== ""
                ? Number(compareAtPrice)
                : null,
            stock: Number(stock || 0),
          },
        },

        images:
          imageCreateData.length > 0
            ? {
                create: imageCreateData,
              }
            : undefined,
      },

      include: {
        variants: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}