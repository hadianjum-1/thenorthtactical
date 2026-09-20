import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cartId";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const variantId = body.variantId;
    const quantity = Number(body.quantity ?? 1);

    if (!variantId) {
      return NextResponse.json(
        {
          success: false,
          message: "variantId is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      return NextResponse.json(
        {
          success: false,
          message: "Product variant not found",
        },
        { status: 404 }
      );
    }

    if (variant.product.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Product is not available",
        },
        { status: 400 }
      );
    }

    if (variant.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough stock available",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    let cartId = cookieStore.get(CART_COOKIE)?.value;

    let cart;

    if (cartId) {
      cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
      });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {},
      });

      cartId = cart.id;

      cookieStore.set(CART_COOKIE, cartId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variant.stock) {
        return NextResponse.json(
          {
            success: false,
            message: "Not enough stock available",
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: {
        id: cart.id,
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

    return NextResponse.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("POST cart item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}