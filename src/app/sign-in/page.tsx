import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInForm } from "@/components/sign-in-form";

export const metadata = {
    title: "Sign In | Ayushi Indian Kitchen",
};

export default async function SignInPage() {
    const session = await getServerSession(authOptions);
    if (session?.user) {
        if (session.user.isAdmin) {
            redirect("/admin");
        } else {
            redirect("/");
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-lg">
                <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">
                        Welcome Back
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-100">
                        Sign in to your account
                    </h1>
                    <p className="text-sm text-slate-400">
                        Use your Google account to sign in and view your orders.
                    </p>
                </div>
                <div className="mt-8">
                    <SignInForm />
                </div>
            </div>
        </main>
    );
}
