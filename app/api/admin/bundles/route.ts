import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireStaff() {
  const session = await auth();

  if (
    !session?.user ||
    !["ADMIN", "STAFF"].includes(session.user.role)
  ) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bundles = await prisma.bundle.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bundles);
  } catch (error) {
    console.error("GET /api/admin/bundles error:", error);

    return NextResponse.json(
      { message: "Failed to load bundles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const price = Number(body.price);
    const items = Array.isArray(body.items) ? body.items : [];

    if (!title || !slug || !Number.isInteger(price) || price < 0) {
      return NextResponse.json(
        { message: "Title, slug, and a valid price are required" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { message: "At least one bundle item is required" },
        { status: 400 }
      );
    }

    const normalizedItems = items.map((item: { variantId?: unknown; quantity?: unknown }) => ({
      variantId: String(item.variantId || ""),
      quantity: Number(item.quantity || 1),
    }));

    if (
      normalizedItems.some(
        (item: { variantId: string; quantity: number }) =>
          !item.variantId ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
      )
    ) {
      return NextResponse.json(
        { message: "Each item needs a valid variant and quantity" },
        { status: 400 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: normalizedItems.map(
            (item: { variantId: string }) => item.variantId
          ),
        },
      },
      select: { id: true, productId: true },
    });

    if (variants.length !== normalizedItems.length) {
      return NextResponse.json(
        { message: "One or more bundle variants do not exist" },
        { status: 400 }
      );
    }

    const bundle = await prisma.bundle.create({
      data: {
        title,
        slug,
        description: body.description
          ? String(body.description).trim()
          : null,
        price,
        active: body.active ?? false,
        items: {
          create: normalizedItems.map(
            (item: { variantId: string; quantity: number }) => {
              const variant = variants.find(
                (candidate) => candidate.id === item.variantId
              );

              return {
                variantId: item.variantId,
                productId: variant?.productId,
                quantity: item.quantity,
              };
            }
          ),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/bundles error:", error);

    return NextResponse.json(
      { message: "Failed to create bundle" },
      { status: 500 }
    );
  }
}