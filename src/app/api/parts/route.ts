import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const partSchema = z.object({
  name: z.string().trim().min(1, "部品名を入力してください"),
  partNumber: z.string().trim().min(1, "型番を入力してください"),
  unitPrice: z.number().int().min(0),
  manufacturer: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  minStock: z.number().int().min(0).default(0),
  note: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = partSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力エラー" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  try {
    const created = await prisma.part.create({
      data: {
        name: d.name,
        partNumber: d.partNumber,
        unitPrice: d.unitPrice,
        manufacturer: d.manufacturer || null,
        location: d.location || null,
        minStock: d.minStock,
        note: d.note || null,
      },
    });
    return NextResponse.json({ id: created.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "同じ型番の部品が既に存在します" },
        { status: 409 },
      );
    }
    throw e;
  }
}
