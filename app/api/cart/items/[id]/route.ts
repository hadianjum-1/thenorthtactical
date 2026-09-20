import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function getCartId() {
  const cookieStore = await cookies();

  return cookieStore.get("cartId")?.value;
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    const cartId = await getCartId();

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cartId,
      },
      include: {
        variant: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    if (quantity > item.variant.stock) {
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
        id,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH cart item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart item",
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
    const { id } = await params;

    const cartId = await getCartId();

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cartId,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE cart item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}