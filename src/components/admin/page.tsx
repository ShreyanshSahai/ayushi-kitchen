import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { FoodItemListItem } from "@/components/admin/food-item-list-item";
import { addFoodItem } from "@/app/admin/food-items/actions";

export const metadata = {
    title: "Manage Food Items | Ayushi Indian Kitchen",
};

export default async function ManageFoodItemsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    const [foodItems, ingredients, types] = await Promise.all([
        prisma.foodItem.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
            include: {
                madeWith: {
                    include: {
                        ingredient: true,
                    },
                },
                type: true,
            },
        }),
        prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
        prisma.foodType.findMany({ orderBy: { name: "asc" } }),
    ]);

    const serializedFoodItems = foodItems.map((food) => ({
        ...food,
        originalPrice: Number(food.originalPrice),
        discountedPrice:
            food.discountedPrice !== null ? Number(food.discountedPrice) : null,
    }));

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="text-base text-orange-400 hover:text-orange-300"
                    >
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
                        Manage Food Items
                    </h1>
                    <p className="mt-1 text-lg text-slate-300">
                        Add new dishes or view existing ones.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2">
                    <div className="space-y-10">
                        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg">
                            <h2 className="text-lg font-semibold text-slate-100">
                                Add a New Food Item
                            </h2>
                            <form
                                action={addFoodItem}
                                className="mt-4 space-y-4"
                            >
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                    placeholder="Name"
                                />
                                <input
                                    name="description"
                                    type="text"
                                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                    placeholder="Description"
                                />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <input
                                        name="originalPrice"
                                        type="number"
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                        placeholder="Original Price"
                                    />
                                    <input
                                        name="discountedPrice"
                                        type="number"
                                        className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                        placeholder="Discounted Price"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="typeId"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Food Type
                                    </label>
                                    <select
                                        id="typeId"
                                        name="typeId"
                                        className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                    >
                                        <option value="">Select a type</option>
                                        {types.map((type) => (
                                            <option
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* We will add ingredient selection in a follow-up step */}
                                <button
                                    type="submit"
                                    className="w-full cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                                >
                                    Add Food Item
                                </button>
                            </form>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg">
                            <h2 className="text-lg font-semibold text-slate-100">
                                Existing Food Items
                            </h2>
                            <ul className="mt-4 space-y-2">
                                {serializedFoodItems.map((foodItem) => (
                                    <FoodItemListItem
                                        key={foodItem.id}
                                        foodItem={foodItem}
                                        ingredients={ingredients}
                                        types={types}
                                    />
                                ))}
                                {serializedFoodItems.length === 0 && (
                                    <p className="text-base text-slate-400">
                                        No food items have been added yet.
                                    </p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
