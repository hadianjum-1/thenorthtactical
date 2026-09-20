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
        images: true,
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
      },

      include: {
        category: true,
        variants: true,
        images: true,
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
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only admins can delete products" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    await prisma.product.delete({
      where: { id },
    });

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