import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "STAFF"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "STAFF"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (
      body.status &&
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        ...(body.status && {
          status: body.status,
        }),
      },
      include: {
        items: true,
        payments: true,
      },
      });

      if (body.paymentStatus) {
        await tx.payment.updateMany({
          where: { orderId: id },
          data: { status: body.paymentStatus },
        });
      }

      if (
        body.status === "DELIVERED" &&
        existingOrder.status !== "DELIVERED" &&
        existingOrder.userId
      ) {
        const points = Math.floor(existingOrder.grandTotal / 100);

        if (points > 0) {
          const account = await tx.loyaltyAccount.upsert({
            where: { userId: existingOrder.userId },
            create: {
              userId: existingOrder.userId,
              pointsBalance: points,
            },
            update: {
              pointsBalance: { increment: points },
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              accountId: account.id,
              pointsDelta: points,
              reason: "Order delivered",
              referenceId: id,
            },
          });
        }
      }

      return updatedOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}