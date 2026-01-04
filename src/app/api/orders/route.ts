import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma, User } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
    customer: z.object({
        name: z.string().min(1),
        mobile: z.string().min(6), // Assuming a minimum length for mobile
        email: z.string().email(),
    }),
    items: z
        .array(
            z.object({
                foodItemId: z.coerce.number().int().positive(),
                quantity: z.coerce.number().int().positive(),
            })
        )
        .min(1),
});

type TransactionClient = Omit<
    Prisma.TransactionClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

async function findOrCreateUser(
    tx: TransactionClient,
    customer: z.infer<typeof orderSchema>["customer"],
    sessionUserId?: number
): Promise<User> {
    const { name, mobile, email } = customer;

    const userData = {
        name,
        mobile,
        email,
        updatedAt: new Date(),
    };

    if (sessionUserId) {
        const user = await tx.user.findUnique({ where: { id: sessionUserId } });
        if (user) {
            return tx.user.update({ where: { id: user.id }, data: userData });
        }
    }

    const existingUser = await tx.user.findFirst({
        where: {
            OR: [{ mobile }, ...(email ? [{ email }] : [])],
        },
    });

    if (existingUser) {
        return tx.user.update({
            where: { id: existingUser.id },
            data: userData,
        });
    }

    return tx.user.create({
        data: { name, mobile, email },
    });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const json = await request.json();
    const result = orderSchema.safeParse(json);

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid payload", details: result.error.flatten() },
            { status: 400 }
        );
    }

    const {
        customer: { name, mobile, email },
        items,
    } = result.data;

    const foodIds = [...new Set(items.map((item) => item.foodItemId))];

    const foods = await prisma.foodItem.findMany({
        where: {
            id: { in: foodIds },
            isActive: true,
        },
    });

    if (foods.length !== foodIds.length) {
        return NextResponse.json(
            { error: "One or more food items could not be found." },
            { status: 404 }
        );
    }

    const soldOutItems = foods.filter((food) => food.isSoldOut);
    if (soldOutItems.length > 0) {
        return NextResponse.json(
            {
                error: `Some items are sold out: ${soldOutItems
                    .map((i) => i.name)
                    .join(", ")}`,
            },
            { status: 409 }
        );
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            const user = await findOrCreateUser(
                tx,
                { name, mobile, email },
                session?.user?.id
            );

            const foodMap = new Map(foods.map((food) => [food.id, food]));

            // Calculate total price
            const totalPrice = items.reduce((sum, item) => {
                const food = foodMap.get(item.foodItemId)!;
                const pricePerItem = food.discountedPrice ?? food.originalPrice;
                return sum + Number(pricePerItem) * item.quantity;
            }, 0);

            if (!user?.id) {
                throw new Error("User could not be found or created.");
            }

            const customerOrder = await tx.customerOrder.create({
                data: {
                    customerName: name,
                    customerMobile: mobile,
                    customerEmail: email,
                    totalPrice,
                    userId: user.id,
                    items: {
                        create: items.map((item) => {
                            const food = foodMap.get(item.foodItemId)!;
                            const pricePerItem =
                                food.discountedPrice ?? food.originalPrice;
                            return {
                                foodItemId: item.foodItemId,
                                quantity: item.quantity,
                                price: pricePerItem,
                            };
                        }),
                    },
                },
            });

            return { user, order: customerOrder };
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
