import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { AdminOrdersClient } from "@/components/admin/orders-client";

export const metadata = {
    title: "Manage Orders | Ayushi Indian Kitchen",
};

export default async function AdminOrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                        Manage Orders
                    </h1>
                    <Link
                        href="/admin"
                        className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                    >
                        &larr; Back to Dashboard
                    </Link>
                </div>
                <AdminOrdersClient />
            </div>
        </main>
    );
}
