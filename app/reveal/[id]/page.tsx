import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import RevealContent from '@/components/RevealContent'

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Call the RPC function `get_secret`
    // The RPC returns a table/set of rows.
    const { data: secrets, error } = await supabase.rpc('get_secret', { secret_id: id })

    if (error) {
        console.error("Error fetching secret:", error)
        return notFound()
    }

    if (!secrets || secrets.length === 0) {
        return notFound()
    }

    const secret = secrets[0]
    // RPC returns string for dates, strict comparison might need verification but new Date() works.
    const isLocked = new Date(secret.delivery_date) > new Date()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-950 text-white">
            <RevealContent secret={secret} isLocked={isLocked} />
        </div>
    )
}
