import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// POST /api/user/balance - Top up user balance
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah nominal top up harus lebih besar dari 0." },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: "Maksimal top up sekaligus adalah $100,000." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        balance: { increment: amount }
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        isSubscribed: true,
        subscriptionTier: true,
        role: true
      }
    });

    // Create confirmation notification
    try {
      await prisma.notification.create({
        data: {
          userId: sessionUser.id,
          title: "Top Up Saldo Berhasil",
          message: `Saldo sebesar $${amount.toLocaleString()} berhasil ditambahkan ke akun Anda. Saldo baru: $${updatedUser.balance.toLocaleString()}.`,
          type: "success"
        }
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Top up $${amount.toLocaleString()} berhasil`,
      balance: updatedUser.balance,
      user: updatedUser
    });
  } catch (error) {
    console.error("Top up balance error:", error);
    return NextResponse.json(
      { error: "Gagal memproses top up saldo." },
      { status: 500 }
    );
  }
}
