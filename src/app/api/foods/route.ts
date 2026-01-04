import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("typeId");
  const featuredOnly = searchParams.get("featured") === "true";

  const parsedTypeId =
    typeParam && typeParam !== "all" ? Number(typeParam) : null;
  const typeFilter =
    parsedTypeId !== null && Number.isInteger(parsedTypeId) && parsedTypeId > 0
      ? parsedTypeId
      : null;

  const foods = await prisma.foodItem.findMany({
    where: {
      isActive: true,
      ...(featuredOnly ? { isFeatured: true } : {}),
      ...(typeFilter !== null
        ? {
            typeId: typeFilter,
          }
        : {}),
    },
    include: {
      type: true,
      images: true,
      madeWith: {
        include: { ingredient: true },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { name: "asc" },
    ],
  });

  return NextResponse.json(foods);
}

