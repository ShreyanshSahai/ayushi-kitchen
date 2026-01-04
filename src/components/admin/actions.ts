"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addFoodItem(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const discountedPrice = parseFloat(
        formData.get("discountedPrice") as string
    );

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.foodItem.create({
        data: {
            name: name.trim(),
            description: description?.trim(),
            originalPrice,
            discountedPrice: discountedPrice > 0 ? discountedPrice : null,
        },
    });

    revalidatePath("/admin/food-items");
}

export async function updateFoodItem(id: number, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const discountedPrice = parseFloat(
        formData.get("discountedPrice") as string
    );

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.foodItem.update({
        where: { id },
        data: {
            name: name.trim(),
            description: description?.trim(),
            originalPrice,
            discountedPrice: discountedPrice > 0 ? discountedPrice : null,
        },
    });

    revalidatePath("/admin/food-items");
}

export async function deleteFoodItem(id: number) {
    await prisma.foodItem.delete({ where: { id } });
    revalidatePath("/admin/food-items");
}
