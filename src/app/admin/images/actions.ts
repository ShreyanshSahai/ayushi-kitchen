"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function addImage(foodItemId: number, formData: FormData) {
    const schema = z.object({
        imageUrl: z.string().url(),
    });

    const parseResult = schema.safeParse({
        imageUrl: formData.get("imageUrl"),
    });

    if (!parseResult.success) {
        throw new Error("Invalid image URL provided.");
    }

    await prisma.image.create({
        data: { foodItemId, path: parseResult.data.imageUrl },
    });

    revalidatePath("/admin/images");
}

export async function deleteImage(id: number, path: string) {
    // In a real app, you would also delete the file from your storage provider (e.g., S3, Cloudinary)
    // For example: await deleteFromCloudStorage(path);

    await prisma.image.delete({
        where: { id },
    });

    revalidatePath("/admin/images");
}
