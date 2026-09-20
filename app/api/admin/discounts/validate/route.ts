import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "STAFF"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { valid: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon code required",
        },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!discount || !discount.active) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    const now = new Date();

    if (
      discount.startsAt &&
      discount.startsAt > now
    ) {
      return NextResponse.json({
        valid: false,
        message: "Coupon is not active yet",
      });
    }

    if (
      discount.endsAt &&
      discount.endsAt < now
    ) {
      return NextResponse.json({
        valid: false,
        message: "Coupon has expired",
      });
    }

    if (
      discount.usageLimit !== null &&
      discount.usageCount >= discount.usageLimit
    ) {
      return NextResponse.json({
        valid: false,
        message: "Coupon usage limit reached",
      });
    }

    return NextResponse.json({
      valid: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
      },
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate coupon",
      },
      { status: 500 }
    );
  }
}