import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import RevealContent from '@/components/RevealContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch the secret
    // We use the 'select' policy which should only return data if delivery_date < now
    // However, we want to know if the record EXISTS even if it's locked, to show the timer.
    // BUT RLS will hide it if we only have the "Anyone can view secrets past delivery date" policy.
    // We need a way to fetch the "metadata" (delivery_date) even if content is hidden.
    //
    // Option 1: Two tables (metadata public, content private). Too complex for now.
    // Option 2: Admin client to fetch delivery_date? No, that exposes too much.
    // Option 3: Adjust RLS to allow select of 'id' and 'delivery_date' for everyone, but 'content' only if time passed.
    // Supabase RLS applies to the whole row. We can use Column Level Privileges but that's standard Postgres.
    //
    // Let's assume for this demo we modify RLS or just trust the client (bad practice but okay for demo).
    // BETTER APPROACH: The RLS policy I wrote:
    // create policy "Anyone can view secrets past delivery date" on secrets for select using (delivery_date < now());
    // This means if I query it and it's locked, I get NOTHING.
    //
    // I need to update the RLS or the strategy.
    // Let's Update RLS to allow reading delivery_date always.
    // actually, "Visible to everyone" for ID and Delivery Date is fine.
    // But Supabase policies are row-based.
    //
    // Workaround: We can use a Postgres Function `get_secret_metadata` or generic "Select" policy for all, 
    // but RLS on columns is tricky in Supabase UI/Auth helper.
    //
    // Alternative: create a policy "Anyone can view delivery date" -> 
    // `using (true)`? No, then they can see content.
    //
    // Let's stick to the plan. If I can't read it, it means it's locked OR doesn't exist.
    // If I can't distinguish, user sees 404. That's not good UX.
    //
    // I will create a second Server Client with "Service Role" just to fetch the delivery date? 
    // No, that's dangerous to expose in Client code, but this is a Server Component.
    // So I CAN use service role key to fetch just the delivery_date.
    // But I don't have the service role key in env vars (only Anon).
    //
    // Okay, let's update schema.sql to allow reading ALL secrets (so we can check date), 
    // BUT we rely on the application layer to hide content? No, RLS is better.
    //
    // Let's try to update RLS to:
    // `using (true)` for SELECT.
    // But wait, then `content` is exposed.
    //
    // Actually, for a visual demo, maybe we just allow reading everything?
    // "Preserve Identity... Security First" says the README.
    //
    // Correct solution: 
    // The 'secrets' table row is visible to everyone, but 'content' and 'media_url' columns are NULL if locked?
    // Postgres doesn't do that easily with RLS.
    //
    // Let's Go with: Fetch using a Remote Procedure (RPC) or just 
    // "Service Role" server-side (since we are in `utils/supabase/server.ts`).
    // Check `utils/supabase/server.ts`... it uses `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    // I should add `SUPABASE_SERVICE_ROLE_KEY` to .env.local for this feature to work securely?
    //
    // OR: I can just make the RLS: `using (true)` and assume the client won't show it? NO.
    //
    // Let's add a `rpc` function to getting status?
    //
    // Simplest for now:
    // I will update RLS to `using (true)`.
    // AND I will use a Postgres Trigger/Function to mask data? No.
    //
    // Let's just use the `service_role` key if checking for existence.
    // Valid point: I don't have the Service Role Key in `.env.local` template.
    //
    // Re-read plan: "If delivery_date > now(): Show Locked...".
    // This implies we CAN see the delivery_date.
    //
    // I will modify the RLS in `schema.sql` (and run it) to allow public access to `id` and `delivery_date`.
    // Actually Supabase RLS is row-level.
    //
    // Okay, I will use `security definer` function to fetch metadata.
    // Or I will just make it public and rely on "Honors System" for this demo? 
    // No, I'll allow SELECT for everyone, but I'll update the policy to:
    // `using (true)`
    // changing the logic to:
    // Clientside: if date > now, content is hidden.
    // Serverside (Supabase): The data is sent.
    // RLS doesn't support column filtering easily.
    //
    // A "Public" view?
    //
    // Let's create a `get_secret` RPC function that returns content ONLY if time passed.
    // And standard select only returns metadata?
    //
    // Let's keep it simple for a demo.
    // I'll grab the row. If it returns data, great. If not (because RLS hidden), it's either locked or 404.
    // If it's locked, I can't show the countdown because I don't know the date!
    //
    // So I MUST be able to read the date.
    //
    // I'll create a new policy: "Anyone can read metadata".
    // Note: "secrets" table has `content`.
    //
    // I will create a database function `get_secret_or_404(uuid)` that returns:
    // id, delivery_date
    // AND content, media_url (only if unlocked).
    //
    // I'll add this to a new migration file `supabase/functions.sql`.

    // For this `RevealPage` implementation, I'll assume I have this function or logic.
    // Let's try to verify if I can just use `createClient(serviceRole)` in `page.tsx` serverside.
    // I'll add `SUPABASE_SERVICE_ROLE_KEY` to .env.local template and use it here.
    // It's a server component so it's safe.

    // Wait, I can't ask user to add Service Role key if they didn't yet.
    // I'll ask them to add it.

    // ALTERNATIVE:
    // Just return the row with `content` as NULL from the DB?
    //
    // I'll create a `seal_metadata` view?
    //
    // Let's go with the RPC function. It's cleaner.
    // `get_secret(secret_id)` -> returns json.

    const { data: secret, error } = await supabase.rpc('get_secret', { secret_id: id })

    if (error || !secret) {
        // If RPC fails or no result, maybe it doesn't exist.
        return notFound()
    }

    const isLocked = new Date(secret.delivery_date) > new Date()

    // If returned data doesn't have content/media_url, it's effectively locked or empty.
    // The RPC should handle the logic.

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-950 text-white">
            <RevealContent secret={secret} isLocked={isLocked} />
        </div>
    )
}
