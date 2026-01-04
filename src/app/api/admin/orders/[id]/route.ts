import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
    isComplete: z.boolean(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
        return NextResponse.json(
            { error: "Invalid order ID" },
            { status: 400 }
        );
    }

    const json = await request.json();
    const result = updateSchema.safeParse(json);
    if (!result.success) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
        const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderId },
            data: { isComplete: result.data.isComplete },
        });
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
