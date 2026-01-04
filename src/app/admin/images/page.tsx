import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ImageManager } from "@/components/admin/image-manager";

export const metadata = {
    title: "Manage Images | Ayushi Indian Kitchen",
};

export default async function ManageImagesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    const foodItems = await prisma.foodItem.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
            images: true,
        },
    });

    const serializedFoodItems = foodItems.map((food) => ({
        ...food,
        originalPrice: Number(food.originalPrice),
        discountedPrice:
            food.discountedPrice !== null ? Number(food.discountedPrice) : null,
    }));

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="text-base text-orange-400 hover:text-orange-300"
                    >
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-100">
                        Manage Food Images
                    </h1>
                    <p className="mt-1 text-xl text-slate-300">
                        Upload, view, or delete images for each food item.
                    </p>
                </div>

                <div className="space-y-8">
                    {serializedFoodItems.map((foodItem) => (
                        <div
                            key={foodItem.id}
                            className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg"
                        >
                            <ImageManager foodItem={foodItem} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
