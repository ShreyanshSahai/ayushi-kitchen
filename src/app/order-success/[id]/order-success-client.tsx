"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    foodItem: {
        name: string;
    };
};

type Order = {
    id: number;
    customerName: string;
    customerMobile: string;
    totalPrice: number;
    items: OrderItem[];
};

type Props = {
    order: Order;
};

export function OrderSuccessClient({ order }: Props) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(5);
    const [isActive, setIsActive] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const whatsappNumber = "+447542693682";
    const message = `Here are my order details: Order #${order.id}\n\nItems:\n${order.items
        .map((item) => `- ${item.foodItem.name} x ${item.quantity} (£${item.price.toFixed(2)})`)
        .join("\n")}\n\nTotal: £${order.totalPrice.toFixed(2)}\nName: ${order.customerName}\nMobile: ${order.customerMobile}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete(true);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isActive]);

    const handleComplete = (isAuto = false) => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (isAuto) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, "_blank");
            router.push("/");
        }
    };

    const handleManual = () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const progress = ((5 - timeLeft) / 5) * 100;

    return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-lg">
                <div className="mb-6 flex justify-center">
                    <div className="relative h-24 w-24">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                className="text-slate-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                            />
                            {/* Progress circle */}
                            <circle
                                className="text-orange-500 transition-all duration-1000 ease-linear"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                                transform="rotate(-90 50 50)"
                            />
                            <text
                                x="50"
                                y="50"
                                className="fill-slate-100 text-2xl font-bold"
                                dominantBaseline="middle"
                                textAnchor="middle"
                            >
                                {timeLeft}
                            </text>
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-100">Order Placed Successfully!</h1>
                <p className="mt-4 text-slate-300">
                    Thank you, {order.customerName}. Your order #{order.id} has been received.
                </p>
                <div className="mt-8 space-y-4">
                    <p className="text-sm text-slate-400">
                        We are redirecting you to WhatsApp to share your order details...
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => handleComplete()}
                            className="flex items-center justify-center rounded-full bg-gradient-to-b from-green-500 to-green-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95"
                        >
                            Complete & Share
                        </button>
                        <button
                            onClick={handleManual}
                            className="flex items-center justify-center rounded-full border border-white/10 bg-slate-700/50 px-8 py-3 font-semibold text-slate-200 transition hover:bg-slate-700/80 active:scale-95"
                        >
                            No, I will do it manually
                        </button>
                    </div>
                    {!isActive && timeLeft > 0 && (
                        <Link
                            href="/"
                            className="mt-4 block text-sm font-medium text-orange-400 hover:text-orange-300"
                        >
                            Back to Home
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
