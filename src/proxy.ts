import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const isProtectedRoute = request.nextUrl.pathname.startsWith("/designer-dashboard");
    const isAuthRoute =
        request.nextUrl.pathname.startsWith("/auth") ||
        request.nextUrl.pathname.startsWith("/become-designer");

    // Not logged in → redirect to login
    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Logged in → check onboarding
    if (isProtectedRoute && user) {
        const { data: designer } = await supabase
            .from("designers")
            .select("onboarding_completed, slug")
            .eq("id", user.id)
            .single();

        const onboardingDone = designer?.onboarding_completed === true;
        const isOnboardingRoute = request.nextUrl.pathname.startsWith(
            "/designer-dashboard/onboarding"
        );

        if (!onboardingDone && !isOnboardingRoute) {
            return NextResponse.redirect(
                new URL("/designer-dashboard/onboarding", request.url)
            );
        }
    }

    // Logged in trying to access auth pages → redirect to dashboard
    if (isAuthRoute && user) {
        return NextResponse.redirect(
            new URL("/designer-dashboard", request.url)
        );
    }

    return response;
}

export const config = {
    matcher: [
        "/designer-dashboard/:path*",
        "/auth",
        "/auth/:path*",
    ],
};