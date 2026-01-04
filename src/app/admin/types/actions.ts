"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addType(formData: FormData) {
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.foodType.create({
        data: {
            name: name.trim(),
        },
    });

    revalidatePath("/admin/types");
}

export async function updateType(id: number, formData: FormData) {
    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return; // Basic validation
    }

    await prisma.foodType.update({ where: { id }, data: { name } });
}

export async function deleteType(id: number) {
    await prisma.foodType.delete({ where: { id } });
    revalidatePath("/admin/types");
}
