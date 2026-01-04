import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

const idSchema = z.coerce.number().int().positive();
const nonNegativePriceSchema = z.coerce.number().nonnegative();
const positivePriceSchema = z.coerce.number().positive();

const madeWithSchema = z
  .array(
    z.object({
      ingredientId: idSchema,
      quantity: z.string().min(1),
    }),
  )
  .optional()
  .default([]);

const imageSchema = z.array(z.string().min(1));

const foodSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  originalPrice: positivePriceSchema,
  discountedPrice: z.union([nonNegativePriceSchema, z.literal(null)]).optional(),
  typeId: idSchema.optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  madeWith: madeWithSchema.optional().default([]),
  images: imageSchema.optional().default([]),
});

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const foods = await prisma.foodItem.findMany({
    include: {
      type: true,
      madeWith: {
        include: {
          ingredient: true,
        },
      },
      images: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(foods);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parseResult = foodSchema.safeParse(json);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const data = parseResult.data;

  try {
    const created = await prisma.foodItem.create({
      data: {
        name: data.name,
        description: data.description,
        originalPrice: new Prisma.Decimal(data.originalPrice),
        discountedPrice:
          data.discountedPrice !== undefined
            ? data.discountedPrice === null
              ? null
              : new Prisma.Decimal(data.discountedPrice)
            : null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        type: data.typeId
          ? {
              connect: {
                id: data.typeId,
              },
            }
          : undefined,
        madeWith: {
          create:
            data.madeWith?.map((mw) => ({
              quantity: mw.quantity,
              ingredient: {
                connect: {
                  id: mw.ingredientId,
                },
              },
            })) ?? [],
        },
        images: {
          create: data.images?.map((path) => ({ path })) ?? [],
        },
      },
      include: {
        type: true,
        madeWith: {
          include: {
            ingredient: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create food item" },
      { status: 500 },
    );
  }
}

