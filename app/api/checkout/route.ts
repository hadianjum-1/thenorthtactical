import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
  email,
  firstName,
  lastName,
  phone,
  address,
  city,
  state,
  postalCode,
  country,
  paymentMethod,
} = body;

const allowedPaymentMethods = [
  "COD",
  "BANK_TRANSFER",
  "JAZZCASH",
  "EASYPAISA",
];

const selectedPaymentMethod = paymentMethod || "COD";

if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid payment method",
    },
    { status: 400 }
  );
}

    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required fields",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const cartId = cookieStore.get("cartId")?.value;

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty",
        },
        { status: 400 }
      );
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
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty",
        },
        { status: 400 }
      );
    }

    // Validate stock and calculate subtotal
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.variant.product.status !== "ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            message: `${item.variant.product.title} is no longer available`,
          },
          { status: 400 }
        );
      }

      if (item.quantity > item.variant.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Not enough stock for ${item.variant.product.title}`,
          },
          { status: 400 }
        );
      }

      subtotal += Number(item.variant.price) * item.quantity;
    }

    const shipping = 0;
    const tax = 0;
    const total = subtotal + shipping + tax;

    // Generate unique order number
    const orderNumber = `TNT-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,

          customerName: `${firstName} ${lastName}`,

          customerEmail: email,
          customerPhone: phone || "",

          subtotal,
          shippingTotal: shipping,
          taxTotal: tax,
          grandTotal: total,

          status: "PENDING",

          shippingAddress: {
            firstName,
            lastName,
            phone: phone || "",
            address,
            city,
            state: state || "",
            postalCode,
            country,
          },

          items: {
            create: cart.items.map((item) => ({
              variantId: item.variant.id,
              titleSnapshot: item.variant.product.title,
              skuSnapshot: item.variant.sku,
              quantity: item.quantity,
              unitPrice: Number(item.variant.price),
              lineTotal:
                Number(item.variant.price) * item.quantity,
            })),
          },
        },
      });
      await tx.payment.create({
  data: {
    orderId: createdOrder.id,
    method: selectedPaymentMethod,
    status: "PENDING",
    amount: total,
  },
});

      // Reduce inventory
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: {
            id: item.variant.id,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Empty cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    // Remove cart cookie
    cookieStore.delete("cartId");

   return NextResponse.json(
  {
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.grandTotal),
    },
    payment: {
      method: selectedPaymentMethod,
      status: "PENDING",
    },
  },
  { status: 201 }
);
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}