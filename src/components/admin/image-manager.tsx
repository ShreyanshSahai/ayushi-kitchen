"use client";

import { useState, useTransition } from "react";
import { FoodItem, Image } from "@prisma/client";
import { addImage, deleteImage } from "@/app/admin/images/actions";

type Props = {
    foodItem: Omit<FoodItem, "originalPrice" | "discountedPrice"> & {
        originalPrice: number;
        discountedPrice: number | null;
        images: Image[];
    };
};

export function ImageManager({ foodItem }: Props) {
    const [imageUrl, setImageUrl] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleDelete = (imageId: number, imagePath: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            startTransition(() => {
                // We'll need the path to delete it from storage later
                void deleteImage(imageId, imagePath);
            });
        }
    };

    const handleSaveImage = (formData: FormData) => {
        startTransition(() => {
            void addImage(foodItem.id, formData).then(() => {
                setImageUrl(""); // Clear input on success
            });
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-100">
                {foodItem.name}
            </h2>
            <div className="mt-4">
                <h3 className="text-base font-medium text-slate-300">
                    Existing Images
                </h3>
                {foodItem.images.length > 0 ? (
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {foodItem.images.map((image) => (
                            <div key={image.id} className="group relative">
                                <img
                                    src={image.path} // Assuming path is a full URL
                                    alt={`Image for ${foodItem.name}`}
                                    className="aspect-square w-full rounded-lg object-cover"
                                />
                                <button
                                    onClick={() =>
                                        handleDelete(image.id, image.path)
                                    }
                                    disabled={isPending}
                                    className="absolute right-1 top-1 cursor-pointer rounded-full bg-red-600/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-500"
                                >
                                    {/* Simple 'X' icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-base text-slate-400">
                        No images have been added for this item yet.
                    </p>
                )}
            </div>
            <div className="mt-6">
                <h3 className="text-base font-medium text-slate-300">
                    Upload New Images
                </h3>
                <form action={handleSaveImage} className="mt-2 space-y-4">
                    <input
                        type="url"
                        name="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                        className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        placeholder="https://example.com/image.jpg"
                    />
                    {imageUrl && (
                        <div>
                            <h4 className="text-xs font-medium text-slate-400">
                                Image Preview
                            </h4>
                            <img
                                src={imageUrl}
                                alt="Image Preview"
                                className="mt-2 h-32 w-32 rounded-lg object-cover ring-1 ring-slate-600"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isPending || !imageUrl}
                        className="cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save Image"}
                    </button>
                </form>
            </div>
        </div>
    );
}
