import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/configurator/saved/[id] - Fetch a single saved build by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const build = await prisma.savedBuild.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    });

    if (!build) {
      return NextResponse.json(
        { error: "Konfigurasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Permission: Owner, Superuser, or Public model
    const isOwner = build.userId === user.id;
    const isSuperuser = user.role === "SUPERUSER";
    const isPublic = build.isPublic;

    if (!isOwner && !isSuperuser && !isPublic) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk melihat konfigurasi ini" },
        { status: 403 }
      );
    }

    return NextResponse.json({ build });
  } catch (error) {
    console.error("Error fetching saved build by ID:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data konfigurasi" },
      { status: 500 }
    );
  }
}

// DELETE /api/configurator/saved/[id] - Remove a saved build from garage
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership or superuser status
    const existing = await prisma.savedBuild.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Konfigurasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id && user.role !== "SUPERUSER") {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin menghapus konfigurasi ini" },
        { status: 403 }
      );
    }

    await prisma.savedBuild.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Konfigurasi berhasil dihapus dari Garage" });
  } catch (error) {
    console.error("Error deleting saved build:", error);
    return NextResponse.json(
      { error: "Gagal menghapus konfigurasi" },
      { status: 500 }
    );
  }
}
