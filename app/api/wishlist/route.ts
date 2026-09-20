import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Login required" },
      { status: 401 }
    );
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(wishlist);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Login required" },
      { status: 401 }
    );
  }

  const { variantId } = await request.json();

  if (!variantId) {
    return NextResponse.json(
      { message: "variantId is required" },
      { status: 400 }
    );
  }

  const wishlist = await prisma.wishlist.upsert({
    where: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
    },
    update: {},
  });

  const existing = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      variantId,
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({
      success: true,
      action: "removed",
    });
  }

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      variantId,
    },
  });

  return NextResponse.json({
    success: true,
    action: "added",
  });
}