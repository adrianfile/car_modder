import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/dashboard/models - List 3D models with search & filter
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all"; // all, saved, public
    const scope = searchParams.get("scope") || "my"; // my or all (if superuser)

    const isSuperuser = user.role === "SUPERUSER";
    const filterAll = scope === "all" && isSuperuser;

    const whereClause: any = {};

    // Scope condition
    if (!filterAll) {
      whereClause.userId = user.id;
    }

    // Status filter
    if (status === "public") {
      whereClause.isPublic = true;
    } else if (status === "saved") {
      whereClause.isPublic = false;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { colorName: { contains: search, mode: "insensitive" } },
        { wheelName: { contains: search, mode: "insensitive" } },
        { caliperName: { contains: search, mode: "insensitive" } }
      ];
    }

    const models = await prisma.savedBuild.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({
      models,
      totalCount: models.length,
      isSuperuser
    });
  } catch (error) {
    console.error("Dashboard models error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar model 3D" },
      { status: 500 }
    );
  }
}
