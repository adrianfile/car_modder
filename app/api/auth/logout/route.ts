import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });

    return NextResponse.json({
      success: true,
      message: "Logout berhasil"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Gagal memproses logout" },
      { status: 500 }
    );
  }
}
