import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

const idSchema = z.coerce.number().int().positive();
const nonNegativePriceSchema = z.coerce.number().nonnegative();
const positivePriceSchema = z.coerce.number().positive();

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    originalPrice: positivePriceSchema.optional(),
    discountedPrice: z.union([nonNegativePriceSchema, z.literal(null)]).optional(),
    typeId: z.union([idSchema, z.literal(null)]).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    madeWith: z
      .array(
        z.object({
          ingredientId: idSchema,
          quantity: z.string().min(1),
        }),
      )
      .optional(),
    images: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, props: RouteParams) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  const foodId = Number(id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const food = await prisma.foodItem.findUnique({
    where: { id: foodId },
    include: {
      type: true,
      madeWith: {
        include: { ingredient: true },
      },
      images: true,
    },
  });

  if (!food) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(food);
}

export async function PUT(request: Request, props: RouteParams) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  const foodId = Number(id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const json = await request.json();
  const parseResult = updateSchema.safeParse(json);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const data = parseResult.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (data.madeWith) {
        await tx.madeWith.deleteMany({ where: { foodItemId: foodId } });
      }
      if (data.images) {
        await tx.image.deleteMany({ where: { foodItemId: foodId } });
      }

      const updatedFood = await tx.foodItem.update({
        where: { id: foodId },
        data: {
          name: data.name,
          description: data.description ?? undefined,
          originalPrice:
            data.originalPrice !== undefined
              ? new Prisma.Decimal(data.originalPrice)
              : undefined,
          discountedPrice:
            data.discountedPrice !== undefined
              ? data.discountedPrice === null
                ? null
                : new Prisma.Decimal(data.discountedPrice)
              : undefined,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          typeId:
            data.typeId !== undefined
              ? data.typeId === null
                ? null
                : data.typeId
              : undefined,
          madeWith: data.madeWith
            ? {
                create: data.madeWith.map((mw) => ({
                  quantity: mw.quantity,
                  ingredient: {
                    connect: {
                      id: mw.ingredientId,
                    },
                  },
                })),
              }
            : undefined,
          images: data.images
            ? {
                create: data.images.map((path) => ({ path })),
              }
            : undefined,
          updatedAt: new Date(),
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

      return updatedFood;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update food item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, props: RouteParams) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  const foodId = Number(id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.foodItem.delete({
      where: { id: foodId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 },
    );
  }
}

