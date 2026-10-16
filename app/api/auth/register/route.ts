import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal harus 6 karakter" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: trimmedEmail,
        password: hashedPassword,
        role: "USER"
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      user
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses registrasi" },
      { status: 500 }
    );
  }
}
