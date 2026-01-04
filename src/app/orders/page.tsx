import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrdersClient } from "@/components/orders/orders-client";

export const metadata = {
    title: "My Orders | Ayushi Indian Kitchen",
};

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <OrdersClient />
        </main>
    );
}
