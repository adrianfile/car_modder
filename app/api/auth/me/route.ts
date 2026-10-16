import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        balance: user.balance,
        isSubscribed: user.isSubscribed,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
