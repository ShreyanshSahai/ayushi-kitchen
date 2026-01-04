import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { addIngredient } from "./actions";
import { IngredientListItem } from "@/components/admin/ingredient-list-item";

export const metadata = {
    title: "Manage Ingredients | Ayushi Indian Kitchen",
};

export default async function ManageIngredientsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    const ingredients = await prisma.ingredient.findMany({
        orderBy: { name: "asc" },
    });

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
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-100">
                        Manage Ingredients
                    </h1>
                    <p className="mt-1 text-xl text-slate-300">
                        Add, edit, or delete ingredients for your dishes.
                    </p>
                </div>

                <div className="space-y-10">
                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg">
                        <h2 className="text-lg font-semibold text-slate-100">
                            Add a New Ingredient
                        </h2>
                        <form action={addIngredient} className="mt-4 space-y-4">
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                placeholder="e.g., Garam Masala, Turmeric"
                            />
                            <button
                                type="submit"
                                className="w-full cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                            >
                                Add Ingredient
                            </button>
                        </form>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg">
                        <h2 className="text-lg font-semibold text-slate-100">
                            Existing Ingredients
                        </h2>
                        <ul className="mt-4 space-y-2">
                            {ingredients.map((ingredient) => (
                                <IngredientListItem
                                    key={ingredient.id}
                                    ingredient={ingredient}
                                />
                            ))}
                            {ingredients.length === 0 && (
                                <p className="text-base text-slate-400">
                                    No ingredients have been added yet.
                                </p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
