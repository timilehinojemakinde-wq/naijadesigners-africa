import { createServerClient }
    from "@supabase/ssr";

import {
    NextResponse,
    type NextRequest,
} from "next/server";

export async function proxy(
    request: NextRequest
) {
    let response =
        NextResponse.next({
            request,
        });

    const supabase =
        createServerClient(
            process.env
                .NEXT_PUBLIC_SUPABASE_URL!,
            process.env
                .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return request.cookies.get(
                            name
                        )?.value;
                    },

                    set(
                        name,
                        value,
                        options
                    ) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        });

                        response =
                            NextResponse.next({
                                request,
                            });

                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },

                    remove(
                        name,
                        options
                    ) {
                        request.cookies.set({
                            name,
                            value: "",
                            ...options,
                        });

                        response =
                            NextResponse.next({
                                request,
                            });

                        response.cookies.set({
                            name,
                            value: "",
                            ...options,
                        });
                    },
                },
            }
        );

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    const isDashboard =
        request.nextUrl.pathname.startsWith(
            "/designer-dashboard"
        );

    const isAuth =
        request.nextUrl.pathname.startsWith(
            "/auth"
        );

    // block dashboard if not logged in
    if (
        isDashboard &&
        !user
    ) {
        return NextResponse.redirect(
            new URL(
                "/auth",
                request.url
            )
        );
    }

    // stop logged in users
    // from seeing auth page
    if (
        isAuth &&
        user
    ) {
        return NextResponse.redirect(
            new URL(
                "/designer-dashboard",
                request.url
            )
        );
    }

    return response;
}

export const config = {
    matcher: [
        "/designer-dashboard/:path*",
        "/auth",
    ],
};
