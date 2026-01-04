import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInForm } from "@/components/admin/sign-in-form";

export const metadata = {
    title: "Admin Sign In | Ayushi Indian Kitchen",
};

export default async function AdminSignInPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin) {
        redirect("/admin");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-200 px-4 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg ring-1 ring-orange-100">
                <div className="space-y-2 text-center">
                    <p className="font-caveat-brush text-2xl tracking-wide text-orange-500">
                        Admin Portal
                    </p>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Sign in to manage the kitchen
                    </h1>
                    <p className="text-sm text-gray-600">
                        Use your authorised Google account to access the
                        dashboard.
                    </p>
                </div>
                <div className="mt-8">
                    <SignInForm />
                </div>
            </div>
        </main>
    );
}
