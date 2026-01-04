import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import "../globals.css";

export const metadata = {
    title: "Admin Dashboard | Ayushi Indian Kitchen",
};

const managementOptions = [
    {
        name: "Back to Website",
        href: "/",
        description: "Return to the main ordering website.",
    },
    {
        name: "Manage Types",
        href: "/admin/types",
        description: "Create, view, edit, and delete food types or categories.",
    },
    {
        name: "Manage Food Items",
        href: "/admin/food-items",
        description: "Add new food items and manage existing ones.",
    },
    {
        name: "Manage Images",
        href: "/admin/images",
        description: "Upload and associate images with your food items.",
    },
    {
        name: "Manage Ingredients",
        href: "/admin/ingredients",
        description: "Keep track of all the ingredients for your dishes.",
    },
    {
        name: "Manage Orders",
        href: "/admin/orders",
        description: "View, manage, and update customer orders.",
    },
    {
        name: "Pending Summary",
        href: "/admin/pending-summary",
        description: "Cumulative totals for all pending (non-completed) orders.",
    },
];

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect("/admin/sign-in");
    }

    return (
        <main className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-10 rounded-2xl border border-orange-400/20 bg-orange-900/10 p-6 text-center shadow-2xl backdrop-blur-lg">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-xl text-slate-300">
                        Welcome, {session.user.name}! Select an option to get
                        started.
                    </p>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {managementOptions.map((option) => (
                        <Link
                            href={option.href}
                            key={option.name}
                            className="block rounded-2xl bg-slate-800/80 p-6 shadow-lg backdrop-blur-sm ring-1 ring-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400"
                        >
                            <h2 className="text-xl font-semibold text-slate-100">
                                {option.name}
                            </h2>
                            <p className="mt-1 text-base text-slate-400">
                                {option.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
