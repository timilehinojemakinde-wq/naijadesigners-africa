import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

webpush.setVapidDetails(
    'mailto:support@fithouseafrica.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function notifyDesigner({
    designerId,
    title,
    body,
    link,
    type = 'general',
}: {
    designerId: string;
    title: string;
    body: string;
    link?: string;
    type?: string;
}): Promise<void> {
    await supabase.from('notifications').insert({
        designer_id: designerId,
        type,
        title,
        body,
        link: link ?? null,
    });

    const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('designer_id', designerId);

    for (const sub of subs ?? []) {
        try {
            await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({ title, body, link })
            );
        } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
        }
    }
}