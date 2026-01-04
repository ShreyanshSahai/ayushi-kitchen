"use client";

import { useState, useTransition } from "react";
import { FoodItem, FoodType, Ingredient, MadeWith } from "@prisma/client";
import { IngredientSelector } from "./ingredient-selector";
import {
    deleteFoodItem,
    updateFoodItem,
    updateFoodItemStatus,
} from "@/app/admin/food-items/actions";

type Props = {
    foodItem: Omit<FoodItem, "originalPrice" | "discountedPrice"> & {
        originalPrice: number;
        discountedPrice: number | null;
        madeWith: (MadeWith & {
            ingredient: Ingredient;
        })[];
        isSoldOut: boolean;
        isWeekendOnly: boolean;
        type: FoodType | null;
    };
    ingredients: Ingredient[];
    types: FoodType[];
};

export function FoodItemListItem({ foodItem, ingredients, types }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${foodItem.name}"?`)) {
            startTransition(() => {
                void deleteFoodItem(foodItem.id);
            });
        }
    };

    const handleEditSubmit = (formData: FormData) => {
        startTransition(() => {
            void updateFoodItem(foodItem.id, formData).then(() => {
                setIsEditing(false);
            });
        });
    };

    const handleStatusChange = (
        key: "isFeatured" | "isSoldOut" | "isWeekendOnly",
        value: boolean
    ) => {
        startTransition(() => {
            const payload = { [key]: value };
            void updateFoodItemStatus(foodItem.id, payload);
        });
    };

    return (
        <li className="flex items-center justify-between rounded-md bg-slate-700/50 px-3 py-2">
            {/* VIEW MODE */}
            {!isEditing && (
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <p className="text-base text-slate-300">
                            {foodItem.name}
                        </p>
                        {foodItem.type && (
                            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
                                {foodItem.type.name}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                        <span className="font-semibold">Price:</span> ₹
                        {foodItem.originalPrice.toFixed(2)}
                        {foodItem.discountedPrice && (
                            <span className="ml-2 text-green-400">
                                (Offer: ₹{foodItem.discountedPrice.toFixed(2)})
                            </span>
                        )}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                        <span className="font-semibold">Ingredients: </span>
                        {foodItem.madeWith.length > 0
                            ? foodItem.madeWith
                                  .map((mw) => mw.ingredient.name)
                                  .join(", ")
                            : "None"}
                    </p>
                    <div className="mt-3 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`featured-${foodItem.id}`}
                                checked={foodItem.isFeatured}
                                onChange={(e) =>
                                    handleStatusChange(
                                        "isFeatured",
                                        e.target.checked
                                    )
                                }
                                disabled={isPending}
                                className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-orange-500 focus:ring-orange-600"
                            />
                            <label
                                htmlFor={`featured-${foodItem.id}`}
                                className="text-xs text-slate-400"
                            >
                                Featured
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`sold-out-${foodItem.id}`}
                                checked={foodItem.isSoldOut}
                                onChange={(e) =>
                                    handleStatusChange(
                                        "isSoldOut",
                                        e.target.checked
                                    )
                                }
                                disabled={isPending}
                                className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-orange-500 focus:ring-orange-600"
                            />
                            <label
                                htmlFor={`sold-out-${foodItem.id}`}
                                className="text-xs text-slate-400"
                            >
                                Sold Out
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`weekend-only-${foodItem.id}`}
                                checked={foodItem.isWeekendOnly}
                                onChange={(e) =>
                                    handleStatusChange(
                                        "isWeekendOnly",
                                        e.target.checked
                                    )
                                }
                                disabled={isPending}
                                className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-orange-500 focus:ring-orange-600"
                            />
                            <label
                                htmlFor={`weekend-only-${foodItem.id}`}
                                className="text-xs text-slate-400"
                            >
                                Weekends only
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
                <form
                    id={`edit-form-${foodItem.id}`}
                    action={handleEditSubmit}
                    className="flex-grow space-y-2"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            name="name"
                            defaultValue={foodItem.name}
                            className="..."
                            autoFocus
                        />
                        <input
                            type="text"
                            name="description"
                            defaultValue={foodItem.description || ""}
                            className="..."
                        />
                        <input
                            type="number"
                            name="originalPrice"
                            defaultValue={Number(foodItem.originalPrice)}
                            step="0.01"
                            className="..."
                        />
                        <input
                            type="number"
                            name="discountedPrice"
                            defaultValue={foodItem.discountedPrice ?? ""}
                            step="0.01"
                            className="..."
                        />

                        <div className="col-span-2">
                            <select
                                name="typeId"
                                defaultValue={foodItem.typeId ?? ""}
                                className="..."
                            >
                                <option value="">Select a type</option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <IngredientSelector
                            allIngredients={ingredients}
                            currentIngredients={foodItem.madeWith}
                        />
                    </div>

                    {/* hidden submit, triggered by Save button */}
                    <button type="submit" className="hidden">
                        Save
                    </button>
                </form>
            )}

            {/* ACTION BUTTONS (MUST BE OUTSIDE THE FORM) */}
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <button
                            type="submit"
                            form={`edit-form-${foodItem.id}`}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-green-400 hover:bg-green-500/20 hover:text-green-300"
                            disabled={isPending}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            disabled={isPending}
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            disabled={isPending}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </li>
    );
}
