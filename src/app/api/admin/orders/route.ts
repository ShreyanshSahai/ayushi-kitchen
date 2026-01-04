import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'pending' or 'completed'

    const whereClause: { isComplete?: boolean } = {};
    if (status === "pending") {
        whereClause.isComplete = false;
    } else if (status === "completed") {
        whereClause.isComplete = true;
    }

    try {
        const orders = await prisma.customerOrder.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        foodItem: true,
                    },
                },
                user: true, // Include user details
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Failed to fetch orders for admin:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
