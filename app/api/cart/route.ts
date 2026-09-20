import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cartId";

async function getCartId(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    new RegExp(`${CART_COOKIE}=([^;]+)`)
  );

  return match ? match[1] : null;
}

export async function GET(request: Request) {
  try {
    const cartId = await getCartId(request);

    if (!cartId) {
      return NextResponse.json({
        success: true,
        cart: null,
      });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
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

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: null,
      });
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("GET cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}