import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, image, currentPassword, newPassword } = body;

    const updateData: {
      name?: string | null;
      image?: string | null;
      password?: string;
    } = {};

    // 1. Update basic info if provided
    if (name !== undefined) {
      updateData.name = name ? String(name).trim() : null;
    }
    if (image !== undefined) {
      updateData.image = image ? String(image).trim() : null;
    }

    // 2. Change password if requested
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal harus 6 karakter" },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Password saat ini wajib diisi untuk verifikasi keamanan" },
          { status: 400 }
        );
      }

      // Fetch user with password for verification
      const fullUser = await prisma.user.findUnique({
        where: { id: sessionUser.id }
      });

      if (!fullUser) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }

      const isMatch = await verifyPassword(currentPassword, fullUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    // Perform database update
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
