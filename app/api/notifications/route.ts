import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/notifications - List user's notifications
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    // If user has zero notifications, seed welcoming system notifications
    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: "Selamat Datang di MOD_CARBON Studio",
            message: "Platform kustomisasi dan showcase 3D Supercar telah siap digunakan.",
            type: "system",
            isRead: false
          },
          {
            userId: user.id,
            title: "3D Configurator Apex GT-R",
            message: "Mulai racik warna bodi, velg satin, dan aerokit carbon di studio 3D.",
            type: "info",
            isRead: false
          }
        ]
      });

      notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      });
    }

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true }
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true, message: "Notifikasi diperbarui" });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui notifikasi" },
      { status: 500 }
    );
  }
}
