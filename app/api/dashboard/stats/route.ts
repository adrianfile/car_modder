import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperuser = user.role === "SUPERUSER";

    // User's own models
    const [myModelsCount, myPublicModelsCount, unreadNotificationsCount, recentMyBuilds] =
      await Promise.all([
        prisma.savedBuild.count({ where: { userId: user.id } }),
        prisma.savedBuild.count({ where: { userId: user.id, isPublic: true } }),
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
        prisma.savedBuild.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            title: true,
            colorName: true,
            colorHex: true,
            finish: true,
            wheelName: true,
            caliperName: true,
            totalPrice: true,
            isPublic: true,
            status: true,
            createdAt: true
          }
        })
      ]);

    // Superuser system metrics
    let adminStats = null;
    if (isSuperuser) {
      const [totalUsers, totalSuperusers, totalSubscribers, balanceAgg, totalAllModels, recentUsers] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { role: "SUPERUSER" } }),
          prisma.user.count({ where: { isSubscribed: true } }),
          prisma.user.aggregate({ _sum: { balance: true } }),
          prisma.savedBuild.count(),
          prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 6,
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
              _count: { select: { savedBuilds: true } }
            }
          })
        ]);

      adminStats = {
        totalUsers,
        totalSuperusers,
        totalSubscribers,
        totalPlatformBalance: balanceAgg._sum?.balance || 0,
        totalAllModels,
        recentUsers
      };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        balance: user.balance,
        isSubscribed: user.isSubscribed,
        subscriptionTier: user.subscriptionTier
      },
      stats: {
        myModelsCount,
        myPublicModelsCount,
        unreadNotificationsCount,
        recentMyBuilds,
        admin: adminStats
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data statistik dashboard" },
      { status: 500 }
    );
  }
}
