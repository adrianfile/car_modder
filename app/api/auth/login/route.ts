import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

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

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      balance: user.balance,
      isSubscribed: user.isSubscribed,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: safeUser
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses login" },
      { status: 500 }
    );
  }
}
