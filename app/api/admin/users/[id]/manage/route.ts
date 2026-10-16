import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// PATCH /api/admin/users/[id]/manage - Superuser updates user's balance and subscription
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
    const { action, balanceAmount, balanceMode, subscriptionTier } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    let notificationTitle = "Pembaruan Akun";
    let notificationMsg = "";

    if (action === "balance" || balanceAmount !== undefined) {
      const numAmount = Number(balanceAmount);
      if (isNaN(numAmount)) {
        return NextResponse.json(
          { error: "Jumlah saldo tidak valid." },
          { status: 400 }
        );
      }

      let newBalance = targetUser.balance;
      if (balanceMode === "add") {
        newBalance = Math.max(0, targetUser.balance + numAmount);
        notificationTitle = "Penyesuaian Saldo Akun";
        notificationMsg = `Administrator menambahkan $${numAmount.toLocaleString()} ke saldo Anda. Saldo sekarang: $${newBalance.toLocaleString()}.`;
      } else if (balanceMode === "deduct") {
        newBalance = Math.max(0, targetUser.balance - numAmount);
        notificationTitle = "Penyesuaian Saldo Akun";
        notificationMsg = `Administrator mengurangi $${numAmount.toLocaleString()} dari saldo Anda. Saldo sekarang: $${newBalance.toLocaleString()}.`;
      } else {
        // "set"
        newBalance = Math.max(0, numAmount);
        notificationTitle = "Penyesuaian Saldo Akun";
        notificationMsg = `Administrator mengatur saldo akun Anda menjadi $${newBalance.toLocaleString()}.`;
      }

      dataToUpdate.balance = newBalance;
    }

    if (action === "subscription" || subscriptionTier !== undefined) {
      if (!["FREE", "PRO", "ENTERPRISE"].includes(subscriptionTier)) {
        return NextResponse.json(
          { error: "Tier langganan tidak valid. Pilih FREE, PRO, atau ENTERPRISE." },
          { status: 400 }
        );
      }

      const isSub = subscriptionTier !== "FREE";
      dataToUpdate.subscriptionTier = subscriptionTier;
      dataToUpdate.isSubscribed = isSub;

      notificationTitle = "Pembaruan Paket Langganan";
      notificationMsg = `Paket langganan MOD_CARBON Studio Anda telah diubah menjadi ${subscriptionTier} oleh administrator.`;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
        _count: { select: { savedBuilds: true } }
      }
    });

    // Send notification to target user
    if (notificationMsg) {
      try {
        await prisma.notification.create({
          data: {
            userId: targetUser.id,
            title: notificationTitle,
            message: notificationMsg,
            type: "success"
          }
        });
      } catch {
        // Non-blocking notification error
      }
    }

    return NextResponse.json({
      message: "Data pengguna berhasil diperbarui oleh SUPERUSER",
      user: updatedUser
    });
  } catch (error) {
    console.error("Manage user error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data pengguna." },
      { status: 500 }
    );
  }
}
