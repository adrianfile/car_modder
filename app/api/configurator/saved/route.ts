import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/configurator/saved - List all saved builds for logged-in user
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedBuilds = await prisma.savedBuild.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ builds: savedBuilds });
  } catch (error) {
    console.error("Error fetching saved builds:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar racikan tersimpan" },
      { status: 500 }
    );
  }
}

// POST /api/configurator/saved - Save current build to user garage
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu untuk menyimpan konfigurasi" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      colorName,
      colorHex,
      finish,
      wheelName,
      wheelId,
      caliperName,
      caliperHex,
      carbonPackage,
      carbonSpoiler,
      totalPrice,
      studioEnv
    } = body;

    if (!colorHex || !wheelName || totalPrice === undefined) {
      return NextResponse.json(
        { error: "Data konfigurasi tidak lengkap" },
        { status: 400 }
      );
    }

    const savedBuild = await prisma.savedBuild.create({
      data: {
        userId: user.id,
        title: title || `Apex GT-R (${colorName || "Custom"})`,
        colorName: colorName || "Custom Paint",
        colorHex: colorHex,
        finish: finish || "gloss",
        wheelName: wheelName,
        wheelId: wheelId || "satin-black",
        caliperName: caliperName || "Brembo Red",
        caliperHex: caliperHex || "#dc2626",
        carbonPackage: Boolean(carbonPackage),
        carbonSpoiler: Boolean(carbonSpoiler),
        totalPrice: Number(totalPrice),
        studioEnv: studioEnv || "dark-showroom"
      }
    });

    return NextResponse.json({
      message: "Konfigurasi berhasil disimpan ke Garage akun Anda!",
      build: savedBuild
    });
  } catch (error) {
    console.error("Error saving build:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan konfigurasi" },
      { status: 500 }
    );
  }
}
