"use client";

import { FoodItem, Image as PrismaImage } from "@prisma/client";
import Image from "next/image";

type SerializedFood = Omit<FoodItem, "originalPrice" | "discountedPrice"> & {
    originalPrice: number;
    discountedPrice: number | null;
    isSoldOut: boolean;
    images: PrismaImage[];
};

type Props = {
    food: SerializedFood;
};

export function FoodItemCard({ food }: Props) {
    const displayImage = food.images[0]?.path || "/placeholder-image.jpg";

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-2xl bg-slate-800/80 shadow-lg ring-1 ring-slate-700 transition-all duration-300 ${
                food.isSoldOut
                    ? "grayscale opacity-60"
                    : "hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400"
            }`}
        >
            <div className="relative aspect-video">
                <Image
                    src={displayImage}
                    alt={food.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
                {food.isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white">
                            SOLD OUT
                        </span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-semibold text-slate-100">
                    {food.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-slate-400">
                    {food.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold text-slate-200">
                        ₹{food.originalPrice.toFixed(2)}
                    </p>
                    {food.isSoldOut ? (
                        <span className="cursor-not-allowed rounded-full bg-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-400">
                            Out of Stock
                        </span>
                    ) : (
                        <button
                            // onClick={() => addToCart(food)}
                            className="cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
