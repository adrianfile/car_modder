import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH /api/admin/users/[id]/role - Toggle or set user role (SUPERUSER only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.role !== "SUPERUSER") {
      return NextResponse.json(
        { error: "Akses ditolak. Fitur ini hanya untuk SUPERUSER." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || (role !== "USER" && role !== "SUPERUSER")) {
      return NextResponse.json(
        { error: "Role tidak valid. Pilih 'USER' atau 'SUPERUSER'." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Safety check: Prevent removing the last superuser
    if (targetUser.role === "SUPERUSER" && role === "USER") {
      const superuserCount = await prisma.user.count({
        where: { role: "SUPERUSER" }
      });
      if (superuserCount <= 1) {
        return NextResponse.json(
          { error: "Tidak dapat mengubah role. Minimal harus ada satu SUPERUSER di sistem." },
          { status: 400 }
        );
      }
    }

    // Update role
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { savedBuilds: true } }
      }
    });

    // Notify user of role change
    try {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          title: "Pembaruan Hak Akses Akun",
          message: `Role akun Anda telah diubah menjadi ${role} oleh administrator.`,
          type: role === "SUPERUSER" ? "warning" : "info"
        }
      });
    } catch {
      // Non-blocking notification error
    }

    return NextResponse.json({
      message: `Role pengguna ${targetUser.email} berhasil diubah ke ${role}`,
      user: updated
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui role pengguna." },
      { status: 500 }
    );
  }
}
