import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home/home-client";

export default async function Home() {
    const [types, foods] = await Promise.all([
        prisma.foodType.findMany({
            orderBy: { name: "asc" },
        }),
        prisma.foodItem.findMany({
            where: { isActive: true },
            include: {
                type: true,
                madeWith: {
                    include: { ingredient: true },
                },
                images: true,
            },
            orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        }),
    ]);

    const serializedFoods = foods.map((food) => ({
        ...food,
        originalPrice: Number(food.originalPrice),
        discountedPrice:
            food.discountedPrice !== null ? Number(food.discountedPrice) : null,
        isSoldOut: food.isSoldOut,
        isWeekendOnly: food.isWeekendOnly,
        images: food.images,
    }));

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <HomeClient types={types} foods={serializedFoods} />
        </main>
    );
}
