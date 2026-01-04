"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addIngredient(formData: FormData) {
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.ingredient.create({
        data: {
            name: name.trim(),
        },
    });

    revalidatePath("/admin/ingredients");
}

export async function updateIngredient(id: number, formData: FormData) {
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.ingredient.update({ where: { id }, data: { name } });
}

export async function deleteIngredient(id: number) {
    await prisma.ingredient.delete({ where: { id } });
    revalidatePath("/admin/ingredients");
}
