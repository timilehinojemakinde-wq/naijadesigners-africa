import { supabase } from "@/lib/supabaseClient";

export async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: "customer" | "designer"
) {
    const {
        data,
        error,
    } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    const user = data.user;

    if (!user) return null;

    const { error: profileError } = await supabase
        .from("profiles")
        .insert({
            id: user.id,
            full_name: fullName,
            email,
            role,
        });

    if (profileError) throw profileError;

    return user;
}

export async function signIn(
    email: string,
    password: string
) {
    const {
        data,
        error,
    } =
        await supabase.auth.signInWithPassword(
            {
                email,
                password,
            }
        );

    if (error) throw error;

    return data.user;
}

export async function signOut() {
    await supabase.auth.signOut();
}

export async function getUser() {
    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    return user;
}
