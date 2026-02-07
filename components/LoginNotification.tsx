'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginNotification() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (searchParams.get('verified')) {
            toast.success('Welcome back! You are signed in.')

            // Clean up the URL
            const newParams = new URLSearchParams(searchParams.toString())
            newParams.delete('verified')
            router.replace(`/?${newParams.toString()}`)
        }
    }, [searchParams, router])

    return null
}
