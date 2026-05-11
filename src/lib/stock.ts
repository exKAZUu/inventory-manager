import { prisma } from "./db";

export type PartWithStock = {
  id: string;
  name: string;
  partNumber: string;
  unitPrice: number;
  manufacturer: string | null;
  location: string | null;
  minStock: number;
  note: string | null;
  stock: number;
};

export async function listPartsWithStock(search?: string): Promise<PartWithStock[]> {
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { partNumber: { contains: search } },
        ],
      }
    : undefined;

  const parts = await prisma.part.findMany({
    where,
    orderBy: { partNumber: "asc" },
  });
  if (parts.length === 0) return [];

  const grouped = await prisma.stockMovement.groupBy({
    by: ["partId", "type"],
    _sum: { quantity: true },
    where: { partId: { in: parts.map((p) => p.id) } },
  });

  const stockMap = new Map<string, number>();
  for (const g of grouped) {
    const cur = stockMap.get(g.partId) ?? 0;
    const delta = (g._sum.quantity ?? 0) * (g.type === "IN" ? 1 : -1);
    stockMap.set(g.partId, cur + delta);
  }

  return parts.map((p) => ({
    id: p.id,
    name: p.name,
    partNumber: p.partNumber,
    unitPrice: p.unitPrice,
    manufacturer: p.manufacturer,
    location: p.location,
    minStock: p.minStock,
    note: p.note,
    stock: stockMap.get(p.id) ?? 0,
  }));
}

export async function getPartStock(partId: string): Promise<number> {
  const grouped = await prisma.stockMovement.groupBy({
    by: ["type"],
    _sum: { quantity: true },
    where: { partId },
  });
  let stock = 0;
  for (const g of grouped) {
    stock += (g._sum.quantity ?? 0) * (g.type === "IN" ? 1 : -1);
  }
  return stock;
}
