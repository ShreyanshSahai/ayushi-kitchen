"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    foodItem: {
        id: number;
        name: string;
        images: Array<{ id: number; path: string }>;
    };
};

type CustomerOrder = {
    id: number;
    customerName: string;
    totalPrice: number;
    isComplete: boolean;
    createdAt: string;
    items: OrderItem[];
};

const currency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
});

export function OrdersClient() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/user/orders");
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    const totalSpent = orders.reduce(
        (sum, order) => sum + Number(order.totalPrice),
        0
    );

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-slate-400">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-4 shadow-2xl backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-100">
                        My Orders
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {session?.user?.name || session?.user?.email}
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                        href="/"
                        className="cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                    >
                        Continue Shopping
                    </Link>
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="cursor-pointer rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-black/20 backdrop-blur-lg transition-all hover:bg-slate-700/50 hover:shadow-xl active:bg-slate-800"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Summary */}
            {orders.length > 0 && (
                <div className="rounded-2xl border border-orange-400/20 bg-orange-900/10 p-6 shadow-2xl backdrop-blur-lg">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-orange-300">
                                Total Orders
                            </p>
                            <p className="text-2xl font-semibold text-orange-100">
                                {orders.length.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-orange-300">
                                Total Spent
                            </p>
                            <p
                                className="text-2xl font-semibold text-orange-100"
                                title={currency.format(totalSpent)}
                            >
                                {currency.format(totalSpent)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-orange-300">
                                Active Orders
                            </p>
                            <p className="text-2xl font-semibold text-orange-100">
                                {orders.filter((o) => !o.isComplete).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-12 text-center shadow-2xl backdrop-blur-lg">
                    <p className="text-lg font-medium text-slate-100">
                        No orders yet
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Start ordering delicious food to see your order history
                        here.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-block cursor-pointer rounded-full bg-gradient-to-b from-orange-400 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 active:shadow-inner"
                    >
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <button
                            key={order.id}
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 p-4 text-left shadow-xl backdrop-blur-lg transition-all hover:border-orange-400/50 hover:bg-slate-700/50"
                        >
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-shrink-0 -space-x-4">
                                        {order.items.slice(0, 3).map((item) => (
                                            <div
                                                key={item.id}
                                                className="h-12 w-12 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-900"
                                            >
                                                {item.foodItem.images[0] ? (
                                                    <img
                                                        src={
                                                            item.foodItem
                                                                .images[0].path
                                                        }
                                                        alt={item.foodItem.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                                                        Img
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-100">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {order.items.length} item
                                            {order.items.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                                    <div className="text-right">
                                        <p className="font-semibold text-orange-400">
                                            {currency.format(
                                                Number(order.totalPrice)
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            !order.isComplete
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-slate-700/50 text-slate-400"
                                        }`}
                                    >
                                        {!order.isComplete
                                            ? "Pending"
                                            : "Delivered"}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-100">
                                    Order #{selectedOrder.id}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    Placed on{" "}
                                    {new Date(
                                        selectedOrder.createdAt
                                    ).toLocaleString("en-GB", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                &times;
                            </button>
                        </div>

                        <ul className="my-6 space-y-4">
                            {selectedOrder.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                                        {item.foodItem.images[0] ? (
                                            <img
                                                src={
                                                    item.foodItem.images[0].path
                                                }
                                                alt={item.foodItem.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                                                Img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-200">
                                            {item.foodItem.name}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300">
                                        {currency.format(
                                            Number(item.price) * item.quantity
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-dashed border-white/10 pt-4">
                            <div className="flex justify-between font-semibold text-slate-100">
                                <span>Total</span>
                                <span>
                                    {currency.format(
                                        Number(selectedOrder.totalPrice)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
