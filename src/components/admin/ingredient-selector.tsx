"use client";

import { Ingredient, MadeWith } from "@prisma/client";
import { useEffect, useState } from "react";

type SelectedIngredient = {
    ingredientId: number;
    name: string;
    quantity: string;
};

type Props = {
    allIngredients: Ingredient[];
    currentIngredients: (MadeWith & { ingredient: Ingredient })[];
};

export function IngredientSelector({
    allIngredients,
    currentIngredients,
}: Props) {
    const [selected, setSelected] = useState<SelectedIngredient[]>(() =>
        currentIngredients.map((mw) => ({
            ingredientId: mw.ingredientId,
            name: mw.ingredient.name,
            quantity: mw.quantity,
        }))
    );

    const [hiddenInputValue, setHiddenInputValue] = useState("");

    useEffect(() => {
        setHiddenInputValue(JSON.stringify(selected));
    }, [selected]);

    const handleAddIngredient = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ingredientId = Number(e.target.value);
        if (
            !ingredientId ||
            selected.some((s) => s.ingredientId === ingredientId)
        ) {
            return;
        }
        const ingredient = allIngredients.find((i) => i.id === ingredientId);
        if (ingredient) {
            setSelected([
                ...selected,
                {
                    ingredientId: ingredient.id,
                    name: ingredient.name,
                    quantity: "",
                },
            ]);
        }
        e.target.value = ""; // Reset dropdown
    };

    const handleRemoveIngredient = (ingredientId: number) => {
        setSelected(selected.filter((s) => s.ingredientId !== ingredientId));
    };

    const handleQuantityChange = (ingredientId: number, quantity: string) => {
        setSelected(
            selected.map((s) =>
                s.ingredientId === ingredientId ? { ...s, quantity } : s
            )
        );
    };

    return (
        <div className="col-span-2 space-y-3 rounded-lg border border-slate-600 p-3">
            <input type="hidden" name="ingredients" value={hiddenInputValue} />
            <h3 className="text-sm font-medium text-slate-300">Ingredients</h3>
            <div className="space-y-2">
                {selected.map((ing) => (
                    <div
                        key={ing.ingredientId}
                        className="flex items-center gap-2"
                    >
                        <span className="flex-1 text-sm text-slate-300">
                            {ing.name}
                        </span>
                        <input
                            type="text"
                            value={ing.quantity}
                            onChange={(e) =>
                                handleQuantityChange(
                                    ing.ingredientId,
                                    e.target.value
                                )
                            }
                            placeholder="Quantity"
                            className="w-32 rounded-md border-slate-600 bg-slate-700/50 px-2 py-1 text-sm text-slate-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                handleRemoveIngredient(ing.ingredientId)
                            }
                            className="text-red-400 hover:text-red-300"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <select
                onChange={handleAddIngredient}
                className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
                <option value="">Add an ingredient...</option>
                {allIngredients
                    .filter(
                        (ing) =>
                            !selected.some((s) => s.ingredientId === ing.id)
                    )
                    .map((ing) => (
                        <option key={ing.id} value={ing.id}>
                            {ing.name}
                        </option>
                    ))}
            </select>
        </div>
    );
}
