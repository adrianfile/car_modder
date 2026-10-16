import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH /api/dashboard/models/[id] - Edit 3D model info & visibility
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.savedBuild.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Model 3D tidak ditemukan" },
        { status: 404 }
      );
    }

    // Must be owner or superuser
    if (existing.userId !== user.id && user.role !== "SUPERUSER") {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin mengedit model ini" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, isPublic } = body;

    const dataToUpdate: any = {};
    if (title && typeof title === "string") {
      dataToUpdate.title = title.trim();
    }
    if (description !== undefined) {
      dataToUpdate.description = description ? String(description).trim() : null;
    }
    if (isPublic !== undefined) {
      dataToUpdate.isPublic = Boolean(isPublic);
      dataToUpdate.status = Boolean(isPublic) ? "public" : "saved";
    }

    const updated = await prisma.savedBuild.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({
      message: "Model 3D berhasil diperbarui",
      model: updated
    });
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui model 3D" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/models/[id] - Delete 3D model
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
    const existing = await prisma.savedBuild.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Model 3D tidak ditemukan" },
        { status: 404 }
      );
    }

    // Must be owner or superuser
    if (existing.userId !== user.id && user.role !== "SUPERUSER") {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin menghapus model ini" },
        { status: 403 }
      );
    }

    await prisma.savedBuild.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Model 3D berhasil dihapus"
    });
  } catch (error) {
    console.error("Delete model error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus model 3D" },
      { status: 500 }
    );
  }
}
