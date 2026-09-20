import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Email and password (minimum 6 characters) are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An operator account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 12);

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: cleanEmail,
        phone: phone?.trim() || null,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer account" },
      { status: 500 }
    );
  }
}
