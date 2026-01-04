import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

const updateSchema = z.object({
  name: z.string().min(1),
});

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, props: RouteParams) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json = await request.json();
  const result = updateSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const ingredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { name: result.data.name, updatedAt: new Date() },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
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
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.ingredient.delete({ where: { id: ingredientId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 },
    );
  }
}

