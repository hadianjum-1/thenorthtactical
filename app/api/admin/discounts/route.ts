import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const discounts = await prisma.discount.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(discounts);
}

export async function POST(request: Request) {
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

  const body = await request.json();

  if (!body.code || body.value === undefined) {
    return NextResponse.json(
      { message: "Code and value are required" },
      { status: 400 }
    );
  }

  const discount = await prisma.discount.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type || "PERCENTAGE",
      value: Number(body.value),
      active: body.active ?? true,
      startsAt: body.startsAt
        ? new Date(body.startsAt)
        : null,
      endsAt: body.endsAt
        ? new Date(body.endsAt)
        : null,
      usageLimit: body.usageLimit
        ? Number(body.usageLimit)
        : null,
    },
  });

  return NextResponse.json(discount, {
    status: 201,
  });
}