import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderSuccessClient } from "./order-success-client";

type Props = {
    params: { id: string };
};

async function getOrder(id: number) {
    const order = await prisma.customerOrder.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    foodItem: true,
                },
            },
        },
    });

    if (!order) return null;

    return {
        ...order,
        totalPrice: order.totalPrice.toNumber(),
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toNumber(),
            foodItem: {
                ...item.foodItem,
                originalPrice: item.foodItem.originalPrice.toNumber(),
                discountedPrice: item.foodItem.discountedPrice?.toNumber() ?? null,
            },
        })),
    };
}

export default async function OrderSuccessPage({ params }: Props) {
    const { id } = await params;
    const orderId = Number.parseInt(id, 10);

    if (Number.isNaN(orderId)) notFound();

    const order = await getOrder(orderId);

    if (!order) notFound();

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <OrderSuccessClient order={order} />
        </main>
    );
}
