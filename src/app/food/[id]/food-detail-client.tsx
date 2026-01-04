"use client";

import { useCart } from "@/components/home/cart-context";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useMemo, useState } from "react";

type Ingredient = {
    id: number;
    name: string;
};

type FoodImage = {
    id: number;
    path: string;
};

type FoodItem = {
    id: number;
    name: string;
    description: string | null;
    originalPrice: number;
    discountedPrice: number | null;
    isFeatured: boolean;
    isSoldOut: boolean;
    isWeekendOnly: boolean;
    isActive: boolean;
    type: {
        id: number;
        name: string;
    } | null;
    madeWith: Array<{
        id: number;
        quantity: string;
        ingredient: Ingredient;
    }>;
    images: FoodImage[];
};

type Props = {
    food: FoodItem;
};

const currency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
});

export function FoodDetailClient({ food }: Props) {
    const { data: session } = useSession();
    const { cart, addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(
        food.images[0]?.path || "/placeholder.svg"
    );
    const [isAdding, setIsAdding] = useState(false);

    const isWeekend = useMemo(() => {
        const today = new Date().getDay();
        return today === 0 || today === 6; // Sunday or Saturday
    }, []);

    const handleAddToCart = () => {
        addToCart(food);
        setIsAdding(true);
        setTimeout(() => {
            setIsAdding(false);
        }, 2000); // Animation duration
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-20 pt-6">
            <header className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-800/50 p-4 shadow-2xl backdrop-blur-lg md:justify-between">
                <Link
                    href="/"
                    className="hidden text-3xl text-slate-100 md:block"
                    style={{ fontFamily: '"Caveat Brush", cursive' }}
                >
                    Ayushi Indian Kitchen
                </Link>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                        <Link
                            href="/#cart-section"
                            className="relative hidden cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-black/20 backdrop-blur-lg transition-all hover:bg-slate-700/50 hover:shadow-xl active:bg-slate-800 md:flex"
                            aria-label="Go to cart"
                        >
                            <svg // Cart Icon
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                />
                            </svg>
                            <span className="md:inline">Cart</span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {cart.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                )}
                            </span>
                        </Link>
                    )}
                    {session?.user ? (
                        <>
                            <Link
                                href="/"
                                className="cursor-pointer rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-black/20 backdrop-blur-lg transition-all hover:bg-slate-700/50 hover:shadow-xl active:bg-slate-800"
                            >
                                My Orders
                            </Link>
                            {session.user.isAdmin && (
                                <Link
                                    href="/admin"
                                    className="cursor-pointer rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg shadow-white/10 transition hover:bg-white active:bg-slate-200"
                                >
                                    Admin
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="cursor-pointer rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-black/20 backdrop-blur-lg transition-all hover:bg-slate-700/50 hover:shadow-xl active:bg-slate-800"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main className="grid gap-8 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg md:grid-cols-2 md:gap-12 md:p-8">
                <div className="flex flex-col gap-4">
                    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-900/50">
                        <img
                            src={selectedImage}
                            alt={food.name}
                            className="h-full w-full object-cover transition-all duration-300"
                        />
                    </div>
                    {food.images.length > 1 && (
                        <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
                            {food.images.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setSelectedImage(image.path)}
                                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 hover:border-orange-400 ${
                                        selectedImage === image.path
                                            ? "border-orange-500"
                                            : "border-transparent"
                                    }`}
                                >
                                    <img
                                        src={image.path}
                                        alt={`Thumbnail of ${food.name}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    {food.type && (
                        <span className="text-sm font-semibold uppercase tracking-wider text-orange-400">
                            {food.type.name}
                        </span>
                    )}
                    <h1 className="mt-1 text-4xl font-bold text-slate-100">
                        {food.name}
                    </h1>
                    <p className="mt-4 text-base text-slate-300">
                        {food.description}
                    </p>

                    {food.madeWith.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                Main Ingredients
                            </h2>
                            <ul className="mt-2 flex flex-wrap gap-2">
                                {food.madeWith.map((item) => (
                                    <li
                                        key={item.id}
                                        className="rounded-full bg-slate-700/50 px-3 py-1 text-sm text-slate-300"
                                    >
                                        {item.ingredient.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-auto pt-8">
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/30 p-4">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-orange-400">
                                    {currency.format(
                                        food.discountedPrice ??
                                            food.originalPrice
                                    )}
                                </span>
                                {food.discountedPrice && (
                                    <span className="text-sm text-slate-500 line-through">
                                        {currency.format(food.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {food.isWeekendOnly && !isWeekend ? (
                                <div className="rounded-full border-slate-600 bg-slate-700 px-6 py-3 text-base font-semibold text-slate-400">
                                    Available on weekends
                                </div>
                            ) : food.isSoldOut ? (
                                <div className="rounded-full bg-red-900/50 px-6 py-3 text-base font-semibold text-red-300">
                                    Sold Out
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    type="button"
                                    className={`flex w-auto min-w-[150px] cursor-pointer items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:shadow-none ${
                                        isAdding
                                            ? "bg-green-600 shadow-green-500/30"
                                            : "bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                                    }`}
                                    disabled={
                                        (food.isWeekendOnly && !isWeekend) ||
                                        food.isSoldOut ||
                                        isAdding
                                    }
                                >
                                    {isAdding ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={3}
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 12.75l6 6 9-13.5"
                                            />
                                        </svg>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FoodDetailClient;
