import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Pending Summary | Ayushi Indian Kitchen",
};

async function getPendingSummary() {
    const pendingOrders = await prisma.customerOrder.findMany({
        where: {
            isComplete: false,
        },
        include: {
            items: {
                include: {
                    foodItem: true,
                },
            },
        },
    });

    const summary: Record<string, { quantity: number; foodName: string }> = {};

    pendingOrders.forEach((order) => {
        order.items.forEach((item) => {
            const foodId = item.foodItemId.toString();
            if (!summary[foodId]) {
                summary[foodId] = {
                    quantity: 0,
                    foodName: item.foodItem.name,
                };
            }
            summary[foodId].quantity += item.quantity;
        });
    });

    return Object.values(summary).sort((a, b) => b.quantity - a.quantity);
}

export default async function PendingSummaryPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    const summaryItems = await getPendingSummary();

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                            Pending Order Summary
                        </h1>
                        <p className="mt-2 text-slate-400">
                            Cumulative totals for all items in "Pending" status.
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                    >
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-800/50 shadow-2xl backdrop-blur-lg overflow-hidden">
                    {summaryItems.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-200">Food Item</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-200">Total Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {summaryItems.map((item) => (
                                    <tr key={item.foodName} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                                            {item.foodName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">
                                            <span className="inline-flex items-center justify-center rounded-full bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-400">
                                                {item.quantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-slate-400">No pending orders at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
