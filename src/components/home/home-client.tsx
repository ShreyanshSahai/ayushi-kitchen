"use client";

import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/components/home/cart-context";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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

type FoodType = {
    id: number;
    name: string;
};

type Props = {
    types: FoodType[];
    foods: FoodItem[];
};

const currency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
});

export function HomeClient({ types, foods }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedType, setSelectedType] = useState<"all" | number>("all");
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
        useCart();
    const [customerName, setCustomerName] = useState(session?.user?.name || "");
    const [customerMobile, setCustomerMobile] = useState(
        session?.user?.mobile || ""
    );
    const [customerEmail, setCustomerEmail] = useState(
        session?.user?.email || ""
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{
        cart?: string;
        name?: string;
        mobile?: string;
        email?: string;
    }>({});
    // State to manage the live input values for cart item quantities
    const [quantityInputs, setQuantityInputs] = useState<{
        [foodId: number]: string;
    }>({});

    const isWeekend = useMemo(() => {
        const today = new Date().getDay();
        return today === 0 || today === 6; // Sunday or Saturday
    }, []);
    useEffect(() => {
        if (session?.user) {
            setCustomerName(session.user.name || "");
            setCustomerEmail(session.user.email || "");
            setCustomerMobile(session.user.mobile || "");
        }
    }, [session]);
    const [animatingFoodId, setAnimatingFoodId] = useState<number | null>(null);

    // Sync quantityInputs state when the cart changes from external actions
    useEffect(() => {
        const newQuantityInputs: { [foodId: number]: string } = {};
        cart.forEach((item) => {
            newQuantityInputs[item.food.id] = item.quantity.toString();
        });
        setQuantityInputs(newQuantityInputs);
    }, [cart]);

    const handleQuantityChange = (foodId: number, value: string) => {
        setQuantityInputs((prev) => ({ ...prev, [foodId]: value }));
    };

    const filteredFoods = useMemo(
        () =>
            selectedType === "all"
                ? foods
                : foods.filter((food) => food.type?.id === selectedType),
        [foods, selectedType]
    );

    const featuredFoods = useMemo(
        () => foods.filter((food) => food.isFeatured && food.isActive),
        [foods]
    );

    const totalCost = cart.reduce((sum, item) => {
        const pricePerItem =
            item.food.discountedPrice ?? item.food.originalPrice;
        return sum + pricePerItem * item.quantity;
    }, 0);

    const handleAddToCart = (food: FoodItem) => {
        if (checkoutComplete) return;

        addToCart(food);

        setAnimatingFoodId(food.id);
        setTimeout(() => {
            setAnimatingFoodId(null);
        }, 2000); // Animation duration in ms
    };

    const validateForm = () => {
        const errors: {
            cart?: string;
            name?: string;
            mobile?: string;
            email?: string;
        } = {};
        if (customerName.trim().length === 0) {
            errors.name = "Name is required.";
        }
        if (customerMobile.trim().length === 0) {
            errors.mobile = "Mobile number is required.";
        }
        if (customerEmail.trim().length === 0) {
            errors.email = "Email is required.";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(customerEmail)
        ) {
            errors.email = "Invalid email address.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || checkoutComplete || isSubmitting) return;

        if (!validateForm()) return;
        if (cart.length === 0) {
            setFormErrors((prev) => ({ ...prev, cart: "Your cart is empty." }));
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);
        setFormErrors({});

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer: {
                        name: customerName,
                        mobile: customerMobile,
                        email: customerEmail || undefined,
                    },
                    items: cart.map((entry) => ({
                        foodItemId: entry.food.id,
                        quantity: entry.quantity,
                    })),
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error ?? "Unable to place order.");
            }

            setCheckoutComplete(true);
            const data = await response.json();
            const orderId = data.order.id;
            clearCart();
            // Redirect after a short delay
            setTimeout(() => {
                router.push(`/order-success/${orderId}`);
            }, 1000);
        } catch (error) {
            if (error instanceof Error) {
                setStatusMessage(error.message);
            } else {
                setStatusMessage("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const scrollToCart = () => {
        const cartElement = document.getElementById("cart-section");
        if (cartElement) {
            cartElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-20">
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
                        <button
                            type="button"
                            onClick={scrollToCart}
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
                        </button>
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

            <section className="grid gap-6 rounded-2xl border border-orange-400/20 bg-orange-900/10 p-8 shadow-2xl backdrop-blur-lg md:grid-cols-[2fr,1fr]">
                <div>
                    <h2 className="text-5xl text-orange-100">
                        Welcome to Ayushi Indian Kitchen
                    </h2>
                    <p className="mt-4 text-lg text-orange-200/80">
                        Taste authentic Indian dishes handcrafted with fresh
                        ingredients and timeless recipes.
                    </p>
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-800/50 p-6 shadow-xl backdrop-blur-lg">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-orange-300">
                            Today’s Special
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-100">
                            {featuredFoods[0]?.name ?? "Chef’s Selection"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {featuredFoods[0]?.description ??
                                "Discover our rich, flavorful dish of the day."}
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            className={`flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:shadow-none ${
                                featuredFoods[0]?.isWeekendOnly && !isWeekend
                                    ? "border-slate-600 bg-slate-700 text-slate-400"
                                    : featuredFoods[0]?.isSoldOut
                                    ? "border-red-500/50 bg-red-900/50 text-red-300"
                                    : animatingFoodId === featuredFoods[0]?.id
                                    ? "bg-green-600 shadow-green-500/30"
                                    : "bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                            }`}
                            type="button"
                            onClick={() => {
                                if (
                                    featuredFoods[0] &&
                                    !featuredFoods[0].isSoldOut &&
                                    (!featuredFoods[0].isWeekendOnly ||
                                        isWeekend)
                                ) {
                                    handleAddToCart(featuredFoods[0]);
                                }
                            }}
                            disabled={
                                !featuredFoods[0] ||
                                checkoutComplete ||
                                animatingFoodId === featuredFoods[0]?.id ||
                                (featuredFoods[0]?.isWeekendOnly &&
                                    !isWeekend) ||
                                featuredFoods[0]?.isSoldOut
                            }
                        >
                            {animatingFoodId === featuredFoods[0]?.id ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12.75l6 6 9-13.5"
                                    />
                                </svg>
                            ) : featuredFoods[0]?.isWeekendOnly &&
                              !isWeekend ? (
                                "Available on weekends"
                            ) : featuredFoods[0]?.isSoldOut ? (
                                "Sold Out"
                            ) : (
                                "Order the Special"
                            )}
                        </button>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-slate-100">
                    Featured Picks
                </h2>
                <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
                    {featuredFoods.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            No featured dishes at the moment.
                        </p>
                    ) : (
                        featuredFoods.map((food) => (
                            <Link
                                key={food.id}
                                href={`/food/${food.id}`}
                                className={`group block min-w-[250px] max-w-xs rounded-2xl border p-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${
                                    food.isSoldOut
                                        ? "border-red-500/20 bg-slate-900/50 opacity-60"
                                        : "border-white/10 bg-slate-800/50 hover:border-orange-400/50 hover:shadow-orange-500/10"
                                }`}
                            >
                                <div className="aspect-video overflow-hidden rounded-xl bg-slate-900/50">
                                    {food.images.length > 0 ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={food.images[0].path}
                                            alt={food.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            Image coming soon
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-100">
                                            {food.name}
                                        </h3>
                                        <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300">
                                            {food.type?.name ?? "Chef Special"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-3">
                                        {food.description}
                                    </p>
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-base font-semibold text-orange-400">
                                                {currency.format(
                                                    food.discountedPrice ??
                                                        food.originalPrice
                                                )}
                                            </span>
                                            {food.discountedPrice && (
                                                <span className="text-xs text-orange-400 line-through">
                                                    {currency.format(
                                                        food.originalPrice
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className={`flex h-8 w-auto min-w-[48px] cursor-pointer items-center justify-center rounded-full px-3 text-xs font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:shadow-none ${
                                                food.isWeekendOnly && !isWeekend
                                                    ? "bg-slate-700 text-slate-400"
                                                    : food.isSoldOut
                                                    ? "bg-red-900/50 text-red-300"
                                                    : animatingFoodId ===
                                                      food.id
                                                    ? "bg-green-600 shadow-green-500/30"
                                                    : "bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                                            }`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (
                                                    !food.isSoldOut &&
                                                    (!food.isWeekendOnly ||
                                                        isWeekend)
                                                ) {
                                                    handleAddToCart(food);
                                                }
                                            }}
                                            disabled={
                                                checkoutComplete ||
                                                animatingFoodId === food.id ||
                                                (food.isWeekendOnly &&
                                                    !isWeekend) ||
                                                food.isSoldOut
                                            }
                                        >
                                            {animatingFoodId === food.id ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={3}
                                                    stroke="currentColor"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4.5 12.75l6 6 9-13.5"
                                                    />
                                                </svg>
                                            ) : food.isWeekendOnly &&
                                              !isWeekend ? (
                                                "On Weekends Only"
                                            ) : food.isSoldOut ? (
                                                "Sold Out"
                                            ) : (
                                                "Add"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Floating Cart Button for Mobile */}
            {cart.length > 0 && (
                <button
                    type="button"
                    onClick={scrollToCart}
                    className="fixed bottom-4 right-4 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/50 active:shadow-inner md:hidden"
                    aria-label="Go to cart"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-7 w-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                    </svg>
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-red-500 text-xs font-bold text-white">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                </button>
            )}

            <section className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                selectedType === "all"
                                    ? "border-transparent bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                    : "cursor-pointer border-white/10 bg-slate-800/50 text-slate-300 shadow-black/20 backdrop-blur-lg hover:border-orange-400/50 hover:text-orange-300"
                            }`}
                            type="button"
                            onClick={() => setSelectedType("all")}
                        >
                            All
                        </button>
                        {types.map((type) => (
                            <button
                                key={type.id}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    selectedType === type.id
                                        ? "border-transparent bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                        : "cursor-pointer border-white/10 bg-slate-800/50 text-slate-300 shadow-black/20 backdrop-blur-lg hover:border-orange-400/50 hover:text-orange-300"
                                }`}
                                type="button"
                                onClick={() => setSelectedType(type.id)}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredFoods.map((food) => (
                            <Link
                                key={food.id}
                                href={`/food/${food.id}`}
                                className={`group flex flex-col gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${
                                    food.isSoldOut
                                        ? "border-red-500/20 bg-slate-900/50 opacity-60"
                                        : "border-white/10 bg-slate-800/50 hover:border-orange-400/50 hover:shadow-orange-500/10"
                                }`}
                            >
                                <div className="aspect-video overflow-hidden rounded-xl bg-slate-900/50">
                                    {food.images.length > 0 ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={food.images[0].path}
                                            alt={food.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                            Image coming soon
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-100">
                                                {food.name}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {food.type?.name ?? "Special"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-base font-semibold text-orange-600">
                                                {currency.format(
                                                    food.discountedPrice ??
                                                        food.originalPrice
                                                )}
                                            </span>
                                            {food.discountedPrice && (
                                                <span className="text-xs text-slate-500 line-through">
                                                    {currency.format(
                                                        food.originalPrice
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-3">
                                        {food.description}
                                    </p>
                                    {food.madeWith.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            Made with{" "}
                                            {food.madeWith
                                                .map(
                                                    (item) =>
                                                        `${item.ingredient.name} (${item.quantity})`
                                                )
                                                .join(", ")}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={`mt-auto flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:shadow-none ${
                                        food.isWeekendOnly && !isWeekend
                                            ? "border-slate-600 bg-slate-700 text-slate-400"
                                            : food.isSoldOut
                                            ? "border-red-500/50 bg-red-900/50 text-red-300"
                                            : animatingFoodId === food.id
                                            ? "bg-green-600 shadow-green-500/30"
                                            : "bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (
                                            !food.isSoldOut &&
                                            (!food.isWeekendOnly || isWeekend)
                                        ) {
                                            handleAddToCart(food);
                                        }
                                    }}
                                    disabled={
                                        checkoutComplete ||
                                        animatingFoodId === food.id ||
                                        (food.isWeekendOnly && !isWeekend) ||
                                        food.isSoldOut
                                    }
                                >
                                    {animatingFoodId === food.id ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={3}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 12.75l6 6 9-13.5"
                                            />
                                        </svg>
                                    ) : food.isWeekendOnly && !isWeekend ? (
                                        "Available on weekends"
                                    ) : food.isSoldOut ? (
                                        "Sold Out"
                                    ) : (
                                        "Add to cart"
                                    )}
                                </button>
                            </Link>
                        ))}

                        {filteredFoods.length === 0 && (
                            <p className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 text-center text-sm text-slate-400 shadow-lg backdrop-blur-lg">
                                No dishes available for this type right now.
                            </p>
                        )}
                    </div>
                </div>

                <aside
                    id="cart-section"
                    className="sticky top-6 flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg"
                >
                    <h2 className="text-xl font-semibold text-slate-100">
                        Your Order
                    </h2>
                    {cart.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            Add some dishes to start your order.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map((item) => (
                                <li key={item.food.id} className="flex gap-3">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {item.food.images.length > 0 ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.food.images[0].path}
                                                alt={item.food.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
                                                Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-200">
                                                    {item.food.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {currency.format(
                                                        (item.food
                                                            .discountedPrice ??
                                                            item.food
                                                                .originalPrice) *
                                                            item.quantity
                                                    )}
                                                </p>
                                            </div>
                                            {!checkoutComplete && (
                                                <button
                                                    type="button"
                                                    className="cursor-pointer text-xs text-red-500 hover:text-red-600"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.food.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        {!checkoutComplete && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <label
                                                    className="text-xs text-slate-400"
                                                    htmlFor={`qty-${item.food.id}`}
                                                >
                                                    Qty
                                                </label>
                                                <input
                                                    id={`qty-${item.food.id}`}
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(event) => {
                                                        const newQuantity =
                                                            parseInt(
                                                                event.target
                                                                    .value,
                                                                10
                                                            );
                                                        if (
                                                            !isNaN(newQuantity)
                                                        ) {
                                                            updateQuantity(
                                                                item.food.id,
                                                                newQuantity
                                                            );
                                                        }
                                                    }}
                                                    className="w-16 rounded-lg border border-white/10 bg-slate-700/50 px-2 py-1 text-sm text-slate-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="space-y-3 border-t border-dashed border-orange-200 pt-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                            <span>Total</span>
                            <span>{currency.format(totalCost)}</span>
                        </div>
                    </div>

                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void handleCheckout();
                        }}
                    >
                        <div className="space-y-1">
                            <label
                                className="text-xs font-semibold text-slate-300"
                                htmlFor="customer-name"
                            >
                                Your name
                            </label>
                            <input
                                id="customer-name"
                                type="text"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-slate-800 disabled:text-slate-400"
                                placeholder="e.g. Ayushi"
                                disabled={checkoutComplete}
                            />
                            {formErrors.name && (
                                <p className="text-xs text-red-400">
                                    {formErrors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label
                                className="text-xs font-semibold text-slate-300"
                                htmlFor="customer-mobile"
                            >
                                Mobile number
                            </label>
                            <input
                                id="customer-mobile"
                                type="tel"
                                value={customerMobile}
                                onChange={(event) =>
                                    setCustomerMobile(event.target.value)
                                }
                                className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-slate-800 disabled:text-slate-400"
                                placeholder="e.g. 9876543210"
                                disabled={checkoutComplete}
                            />
                            {formErrors.mobile && (
                                <p className="text-xs text-red-400">
                                    {formErrors.mobile}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label
                                className="text-xs font-semibold text-slate-300"
                                htmlFor="customer-email"
                            >
                                Email
                            </label>
                            <input
                                id="customer-email"
                                type="email"
                                value={customerEmail}
                                onChange={(event) =>
                                    setCustomerEmail(event.target.value)
                                }
                                className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 disabled:bg-slate-800 disabled:text-slate-400"
                                placeholder="e.g. ayushi@example.com"
                                disabled={checkoutComplete}
                            />
                            {formErrors.email && (
                                <p className="text-xs text-red-400">
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner disabled:cursor-not-allowed disabled:from-orange-400/50 disabled:to-orange-600/50 disabled:shadow-none"
                            disabled={
                                cart.length === 0 ||
                                isSubmitting ||
                                checkoutComplete
                            }
                        >
                            {checkoutComplete
                                ? "Order confirmed"
                                : isSubmitting
                                ? "Placing order..."
                                : "Checkout"}
                        </button>
                    </form>
                    {statusMessage && (
                        <p className="text-center text-sm text-orange-400">
                            {statusMessage}
                        </p>
                    )}
                </aside>
            </section>
        </div>
    );
}
