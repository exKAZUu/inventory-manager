import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const moveSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().optional().default(""),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力エラー" }, { status: 400 });
  }
  const d = parsed.data;

  const part = await prisma.part.findUnique({ where: { id }, select: { id: true } });
  if (!part) {
    return NextResponse.json({ error: "部品が見つかりません" }, { status: 404 });
  }
  const created = await prisma.stockMovement.create({
    data: {
      partId: id,
      type: d.type,
      quantity: d.quantity,
      reason: d.reason || null,
    },
  });
  return NextResponse.json({ id: created.id });
}
