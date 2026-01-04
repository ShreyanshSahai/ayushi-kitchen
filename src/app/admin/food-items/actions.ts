"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addFoodItem(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const ingredientsJSON = formData.get("ingredients") as string;
    const ingredients: { ingredientId: number; quantity: string }[] =
        JSON.parse(ingredientsJSON || "[]");

    const discountedPrice = parseFloat(
        formData.get("discountedPrice") as string
    );
    const typeId = formData.get("typeId")
        ? Number(formData.get("typeId"))
        : null;
    const isWeekendOnly = formData.get("isWeekendOnly") === "true";

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.foodItem.create({
        data: {
            name: name.trim(),
            description: description?.trim(),
            originalPrice,
            discountedPrice: discountedPrice > 0 ? discountedPrice : null,
            typeId: typeId,
            isWeekendOnly,
            madeWith: {
                create: ingredients.map((ing) => ({
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                })),
            },
        },
    });

    revalidatePath("/admin/food-items");
}

export async function updateFoodItem(id: number, formData: FormData) {
    type IngredientData = {
        ingredientId: number;
        quantity: string;
    };

    const ingredientsJSON = formData.get("ingredients") as string;
    const ingredients: IngredientData[] = JSON.parse(ingredientsJSON || "[]");
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const discountedPrice = parseFloat(
        formData.get("discountedPrice") as string
    );
    const typeId = formData.get("typeId")
        ? Number(formData.get("typeId"))
        : null;

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
        // 1. Delete existing ingredient associations
        prisma.madeWith.deleteMany({
            where: { foodItemId: id },
        }),
        // 2. Update the food item and create new ingredient associations
        prisma.foodItem.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description?.trim(),
                originalPrice,
                discountedPrice: discountedPrice > 0 ? discountedPrice : null,
                typeId: typeId,
                madeWith: {
                    create: ingredients.map((ing) => ({
                        ingredientId: ing.ingredientId,
                        quantity: ing.quantity,
                    })),
                },
            },
        }),
    ]);

    revalidatePath("/admin/food-items");
}

export async function deleteFoodItem(id: number) {
    await prisma.foodItem.update({
        where: { id },
        data: { isActive: false },
    });
    revalidatePath("/admin/food-items");
}

export async function updateFoodItemStatus(
    id: number,
    data: {
        isFeatured?: boolean;
        isSoldOut?: boolean;
        isWeekendOnly?: boolean;
    }
) {
    if (
        data.isFeatured === undefined &&
        data.isSoldOut === undefined &&
        data.isWeekendOnly === undefined
    ) {
        return;
    }

    await prisma.foodItem.update({
        where: { id },
        data,
    });

    // Revalidate to ensure the list reflects the new status
    revalidatePath("/admin/food-items");
}
