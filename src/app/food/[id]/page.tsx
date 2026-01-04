import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FoodDetailClient } from "./food-detail-client";

type Props = {
    params: { id: string };
};

async function getFoodItem(id: number) {
    const foodItem = await prisma.foodItem.findUnique({
        where: { id },
        include: {
            images: true,
            type: true,
            madeWith: {
                include: {
                    ingredient: true,
                },
            },
        },
    });

    if (!foodItem) {
        console.log(`Food item with id: ${id} not found.`);
        return null;
    }

    return {
        ...foodItem,
        originalPrice: foodItem.originalPrice.toNumber(),
        discountedPrice: foodItem.discountedPrice?.toNumber() ?? null,
    };
}

export default async function FoodDetailPage({ params }: Props) {
    const { id } = await params;

    const foodId = Number.parseInt(id, 10);

    if (Number.isNaN(foodId)) notFound();

    const food = await getFoodItem(foodId);

    if (!food) notFound();

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <FoodDetailClient food={food} />
        </main>
    );
}
