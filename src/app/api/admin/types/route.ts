import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

const typeSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const types = await prisma.foodType.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const result = typeSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const type = await prisma.foodType.create({
      data: { name: result.data.name },
    });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create type" },
      { status: 500 },
    );
  }
}

