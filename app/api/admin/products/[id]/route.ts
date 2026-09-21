import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    session,
    response: null,
  };
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const access = await checkAdminAccess();

    if (access.response) {
      return access.response;
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const access = await checkAdminAccess();

    if (access.response) {
      return access.response;
    }

    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Prepare images data if provided
    let newImages: { url: string; alt: string; sortOrder: number }[] | null = null;
    if (Array.isArray(body.images)) {
      newImages = body.images
        .filter(
          (img: any) =>
            img && typeof img.url === "string" && img.url.trim().length > 0
        )
        .map((img: any, index: number) => ({
          url: String(img.url).trim(),
          alt: String(img.alt || body.title || existingProduct.title).trim(),
          sortOrder:
            typeof img.sortOrder === "number" ? img.sortOrder : index,
        }));
    } else if (body.imageUrl !== undefined) {
      if (body.imageUrl) {
        newImages = [
          {
            url: String(body.imageUrl).trim(),
            alt: String(body.title || existingProduct.title).trim(),
            sortOrder: 0,
          },
        ];
      } else {
        newImages = [];
      }
    }

    const product = await prisma.product.update({
      where: { id },

      data: {
        title: body.title?.trim(),
        slug: body.slug?.trim(),
        description: body.description?.trim(),
        status: body.status,
        featured:
          body.featured !== undefined
            ? Boolean(body.featured)
            : undefined,
        categoryId:
          body.categoryId !== undefined
            ? body.categoryId || null
            : undefined,

        variants:
          existingProduct.variants.length > 0
            ? {
                update: {
                  where: {
                    id: existingProduct.variants[0].id,
                  },
                  data: {
                    sku: body.sku?.trim(),
                    price:
                      body.price !== undefined
                        ? Number(body.price)
                        : undefined,
                    compareAtPrice:
                      body.compareAtPrice !== undefined &&
                      body.compareAtPrice !== ""
                        ? Number(body.compareAtPrice)
                        : null,
                    stock:
                      body.stock !== undefined
                        ? Number(body.stock)
                        : undefined,
                  },
                },
              }
            : undefined,

        images:
          newImages !== null
            ? {
                deleteMany: {},
                create: newImages,
              }
            : undefined,
      },

      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("PATCH product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const access = await checkAdminAccess();

    if (access.response) {
      return access.response;
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          select: { id: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const variantIds = product.variants.map((v) => v.id);

    // Clean up dependent cart & bundle items before deleting product
    await prisma.$transaction([
      ...(variantIds.length > 0
        ? [
            prisma.cartItem.deleteMany({
              where: { variantId: { in: variantIds } },
            }),
          ]
        : []),
      prisma.bundleItem.deleteMany({
        where: {
          OR: [
            ...(variantIds.length > 0
              ? [{ variantId: { in: variantIds } }]
              : []),
            { productId: id },
          ],
        },
      }),
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("DELETE product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}