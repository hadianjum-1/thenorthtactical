import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role as string)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Enrich with user data if userId is present
    const userIds = reviews.map((r) => r.userId).filter(Boolean) as string[];
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = reviews.map((r) => ({
      ...r,
      user: r.userId ? userMap.get(r.userId) ?? null : null,
    }));

    return NextResponse.json({ reviews: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load reviews" }, { status: 500 });
  }
}
