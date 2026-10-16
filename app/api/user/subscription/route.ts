import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// POST /api/user/subscription - User subscribes or changes tier
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (!["FREE", "PRO", "ENTERPRISE"].includes(tier)) {
      return NextResponse.json(
        { error: "Tier langganan tidak valid." },
        { status: 400 }
      );
    }

    const isSubscribed = tier !== "FREE";

    // Subscription prices per month: PRO = $49, ENTERPRISE = $199, FREE = $0
    const tierCost = tier === "PRO" ? 49 : tier === "ENTERPRISE" ? 199 : 0;

    // Check balance if upgrading to paid tier
    if (tierCost > 0 && sessionUser.balance < tierCost && !sessionUser.isSubscribed) {
      return NextResponse.json(
        {
          error: `Saldo tidak mencukupi untuk berlangganan ${tier} ($${tierCost}/bln). Saldo Anda: $${sessionUser.balance.toLocaleString()}. Silakan top up terlebih dahulu.`
        },
        { status: 400 }
      );
    }

    // Deduct cost if first time activating paid tier
    const shouldDeduct = tierCost > 0 && (!sessionUser.isSubscribed || sessionUser.subscriptionTier === "FREE");
    const newBalance = shouldDeduct ? Math.max(0, sessionUser.balance - tierCost) : sessionUser.balance;

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        subscriptionTier: tier,
        isSubscribed,
        balance: newBalance
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        isSubscribed: true,
        subscriptionTier: true
      }
    });

    try {
      await prisma.notification.create({
        data: {
          userId: sessionUser.id,
          title: "Paket Langganan Diperbarui",
          message: isSubscribed
            ? `Selamat! Paket langganan Anda aktif pada tier ${tier}. Nikmati fitur eksklusif 3D Configurator Studio.`
            : `Paket langganan Anda telah diatur ke tier FREE.`,
          type: "success"
        }
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil beralih ke paket ${tier}`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui langganan." },
      { status: 500 }
    );
  }
}
