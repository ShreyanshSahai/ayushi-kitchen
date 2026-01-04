"use client";

import { useEffect, useState, useTransition } from "react";

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    foodItem: {
        id: number;
        name: string;
    };
};

type CustomerOrder = {
    id: number;
    customerName: string;
    customerMobile: string;
    customerEmail: string | null;
    totalPrice: number;
    isComplete: boolean;
    createdAt: string;
    items: OrderItem[];
};

const currency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
});

export function AdminOrdersClient() {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">(
        "pending"
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/admin/orders?status=${filter}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchOrders();
    }, [filter]);

    const handleMarkAsComplete = (orderId: number) => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/admin/orders/${orderId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isComplete: true }),
                });

                if (!response.ok) throw new Error("Failed to update order");

                // Optimistically update UI or refetch
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
            } catch (err) {
                alert(
                    err instanceof Error
                        ? err.message
                        : "Failed to update order"
                );
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {(["pending", "completed", "all"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                            filter === f
                                ? "border-transparent bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                : "cursor-pointer border-white/10 bg-slate-800/50 text-slate-300 shadow-black/20 backdrop-blur-lg hover:border-orange-400/50 hover:text-orange-300"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            {loading ? (
                <p className="text-slate-400">Loading orders...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-12 text-center shadow-lg backdrop-blur-lg">
                    <p className="text-lg font-medium text-slate-200">
                        No {filter !== "all" && filter} orders found.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex flex-col rounded-2xl border border-white/10 bg-slate-800/50 p-6 shadow-xl backdrop-blur-lg"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100">
                                        Order #{order.id}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString("en-GB", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
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
                                        : "Completed"}
                                </span>
                            </div>

                            <div className="my-4 border-t border-dashed border-white/10"></div>

                            <ul className="flex-1 space-y-2 text-sm">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex justify-between"
                                    >
                                        <span className="text-slate-300">
                                            {item.quantity}x{" "}
                                            {item.foodItem.name}
                                        </span>
                                        <span className="text-slate-400">
                                            {currency.format(
                                                Number(item.price) *
                                                    item.quantity
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="my-4 border-t border-dashed border-white/10"></div>

                            <div className="space-y-2 text-sm">
                                <p className="text-slate-300">
                                    <strong>Customer:</strong>{" "}
                                    {order.customerName}
                                </p>
                                <p className="text-slate-300">
                                    <strong>Mobile:</strong>{" "}
                                    {order.customerMobile}
                                </p>
                                {order.customerEmail && (
                                    <p className="text-slate-300">
                                        <strong>Email:</strong>{" "}
                                        {order.customerEmail}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-lg font-semibold text-orange-400">
                                    Total:{" "}
                                    {currency.format(Number(order.totalPrice))}
                                </p>
                                {!order.isComplete && (
                                    <button
                                        onClick={() =>
                                            handleMarkAsComplete(order.id)
                                        }
                                        disabled={isPending}
                                        className="cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-500"
                                    >
                                        {isPending
                                            ? "Updating..."
                                            : "Mark as Completed"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
