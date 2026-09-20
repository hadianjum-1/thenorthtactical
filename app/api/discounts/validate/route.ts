import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, message: "Coupon code required" },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (!discount || !discount.active) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or inactive promotional code",
      });
    }

    const now = new Date();

    if (discount.startsAt && discount.startsAt > now) {
      return NextResponse.json({
        valid: false,
        message: "This promotional code is not active yet",
      });
    }

    if (discount.endsAt && discount.endsAt < now) {
      return NextResponse.json({
        valid: false,
        message: "This promotional code has expired",
      });
    }

    if (
      discount.usageLimit !== null &&
      discount.usageCount >= discount.usageLimit
    ) {
      return NextResponse.json({
        valid: false,
        message: "Promotional code usage limit has been reached",
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
  } catch (error) {
    console.error("Discount validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
