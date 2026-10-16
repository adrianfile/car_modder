import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/users - List all users (SUPERUSER only)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const roleFilter = searchParams.get("role")?.toUpperCase();
    const subFilter = searchParams.get("sub")?.toUpperCase();

    const whereClause: any = {};
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ];
    }
    if (roleFilter && (roleFilter === "USER" || roleFilter === "SUPERUSER")) {
      whereClause.role = roleFilter;
    }
    if (subFilter) {
      if (subFilter === "SUBSCRIBED") {
        whereClause.isSubscribed = true;
      } else if (subFilter === "FREE") {
        whereClause.isSubscribed = false;
      } else if (subFilter === "PRO" || subFilter === "ENTERPRISE") {
        whereClause.subscriptionTier = subFilter;
      }
    }

    const [users, totalSubscribers, balanceAgg] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          balance: true,
          isSubscribed: true,
          subscriptionTier: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { savedBuilds: true }
          }
        }
      }),
      prisma.user.count({ where: { isSubscribed: true } }),
      prisma.user.aggregate({ _sum: { balance: true } })
    ]);

    return NextResponse.json({
      users,
      meta: {
        totalSubscribers,
        totalBalance: balanceAgg._sum?.balance || 0
      }
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pengguna" },
      { status: 500 }
    );
  }
}
