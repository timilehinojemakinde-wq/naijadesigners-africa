"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ApprovalPendingModal from "@/components/dashboard/ApprovalPendingModal";

export default function DesignerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isOnboardingRoute = pathname?.startsWith("/designer-dashboard/onboarding");

    const [checked, setChecked] = useState(false);
    const [brandName, setBrandName] = useState("");
    const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

    useEffect(() => {
        if (isOnboardingRoute) {
            setChecked(true);
            return;
        }

        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("designers")
                .select("brand_name, approval_status, onboarding_completed")
                .eq("id", user.id)
                .single();

            if (!data?.onboarding_completed) {
                router.push("/designer-dashboard/onboarding");
                return;
            }

            setBrandName(data?.brand_name ?? "");
            setApprovalStatus(data?.approval_status ?? "pending");
            setChecked(true);
        };
        check();
    }, [router, isOnboardingRoute]);

    const refreshStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("designers")
            .select("approval_status")
            .eq("id", user.id)
            .single();
        setApprovalStatus(data?.approval_status ?? null);
    };

    if (!checked) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    if (isOnboardingRoute) {
        return <>{children}</>;
    }

    const blocked = approvalStatus === "pending" || approvalStatus === "rejected";

    return (
        <>
            {children}
            {blocked && (
                <ApprovalPendingModal
                    brandName={brandName}
                    status={approvalStatus === "rejected" ? "rejected" : "pending"}
                    dismissible={false}
                    onRefresh={refreshStatus}
                />
            )}
        </>
    );
}