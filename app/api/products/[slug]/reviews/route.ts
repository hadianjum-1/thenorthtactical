import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      approved: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(reviews);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Login required" },
      { status: 401 }
    );
  }

  const { slug } = await context.params;
  const body = await request.json();

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  const rating = Number(body.rating);

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      productId: product.id,
      userId: session.user.id,
      rating,
      title: body.title || null,
      body: body.body || "",
      approved: false,
    },
  });

  return NextResponse.json(review, {
    status: 201,
  });
}