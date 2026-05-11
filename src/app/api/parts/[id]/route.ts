import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  partNumber: z.string().trim().min(1).optional(),
  unitPrice: z.number().int().min(0).optional(),
  manufacturer: z.string().trim().optional(),
  location: z.string().trim().optional(),
  minStock: z.number().int().min(0).optional(),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力エラー" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    const updated = await prisma.part.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.partNumber !== undefined && { partNumber: d.partNumber }),
        ...(d.unitPrice !== undefined && { unitPrice: d.unitPrice }),
        ...(d.manufacturer !== undefined && {
          manufacturer: d.manufacturer || null,
        }),
        ...(d.location !== undefined && { location: d.location || null }),
        ...(d.minStock !== undefined && { minStock: d.minStock }),
        ...(d.note !== undefined && { note: d.note || null }),
      },
    });
    return NextResponse.json({ id: updated.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          { error: "同じ型番の部品が既に存在します" },
          { status: 409 },
        );
      }
      if (e.code === "P2025") {
        return NextResponse.json({ error: "見つかりません" }, { status: 404 });
      }
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.part.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }
    throw e;
  }
}
