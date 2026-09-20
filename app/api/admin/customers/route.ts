import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    // Calculate total spend per customer
    const customerIds = customers.map((c) => c.id);
    const spends = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: { in: customerIds },
        status: { notIn: ["CANCELLED", "REFUNDED", "RETURNED"] },
      },
      _sum: { grandTotal: true },
    });
    const spendMap = new Map(
      spends.map((s) => [s.userId!, s._sum.grandTotal ?? 0])
    );

    const enriched = customers.map((c) => ({
      ...c,
      totalSpend: spendMap.get(c.id) ?? 0,
    }));

    return NextResponse.json({ customers: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load customers" }, { status: 500 });
  }
}
