'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Clock, FileVideo, FileImage, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/utils/supabase/client'

interface Secret {
    id: string
    delivery_date: string
    content: string | null
    media_url: string | null
    created_at: string
}

interface RevealContentProps {
    secret: Secret
    isLocked: boolean
}

export default function RevealContent({ secret, isLocked: initialLocked }: RevealContentProps) {
    const [isLocked, setIsLocked] = useState(initialLocked)
    const [timeLeft, setTimeLeft] = useState('')
    const [isRevealed, setIsRevealed] = useState(false)
    const [isUnboxing, setIsUnboxing] = useState(false)

    // Real-time countdown
    useEffect(() => {
        if (!isLocked) return

        const interval = setInterval(() => {
            const now = new Date()
            const deliveryDate = new Date(secret.delivery_date)

            if (now >= deliveryDate) {
                setIsLocked(false)
                clearInterval(interval)
                // Optionally refresh data here if we didn't have content
                // But for now, user might need to refresh page if content was null
                window.location.reload()
            } else {
                setTimeLeft(formatDistanceToNow(deliveryDate, { addSuffix: true }))
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isLocked, secret.delivery_date])

    const handleUnbox = () => {
        setIsUnboxing(true)
        setTimeout(() => {
            setIsRevealed(true)
            setIsUnboxing(false)
        }, 2000) // 2 seconds animation
    }

    // Generate Media URL
    const supabase = createClient()
    const mediaPublicUrl = secret.media_url
        ? supabase.storage.from('vault').getPublicUrl(secret.media_url).data.publicUrl
        : null

    if (isLocked) {
        return (
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl">
                <CardHeader className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mx-auto bg-neutral-800 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4"
                    >
                        <Lock className="w-10 h-10 text-red-500" />
                    </motion.div>
                    <CardTitle className="text-2xl">Time Capsule Locked</CardTitle>
                    <CardDescription className="text-neutral-400">
                        This memory is sealed until {new Date(secret.delivery_date).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-8">
                    <div className="text-4xl font-mono font-bold text-red-500 tabular-nums">
                        {timeLeft || "Calculating..."}
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">Patience is a virtue.</p>
                </CardContent>
            </Card>
        )
    }

    if (isRevealed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-2xl"
            >
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b dark:border-neutral-800">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Unlock className="w-6 h-6 text-green-500" /> Memory Unlocked
                        </CardTitle>
                        <CardDescription>
                            Sealed on {new Date(secret.created_at).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {secret.content && (
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-lg leading-relaxed">{secret.content}</p>
                            </div>
                        )}

                        {mediaPublicUrl && (
                            <div className="rounded-lg border bg-neutral-100 dark:bg-neutral-800 p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileVideo className="w-5 h-5" />
                                    <span className="font-medium">Attached Media</span>
                                </div>
                                {/* Simple handling: if image, show it. If video, show player. Else download link */}
                                {(mediaPublicUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) ? (
                                    <img src={mediaPublicUrl} alt="Memory" className="rounded-md w-full" />
                                ) : (mediaPublicUrl.match(/\.(mp4|webm|ogg)$/) != null) ? (
                                    <video controls src={mediaPublicUrl} className="rounded-md w-full" />
                                ) : (
                                    <Button asChild variant="outline">
                                        <a href={mediaPublicUrl} download target="_blank">
                                            <Download className="w-4 h-4 mr-2" /> Download Attachment
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <motion.div
                animate={isUnboxing ? {
                    scale: [1, 1.1, 0.9, 1.2, 0],
                    rotate: [0, -5, 5, -10, 0],
                    opacity: [1, 1, 1, 1, 0]
                } : {}}
                transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1] }}
            >
                <Card className="w-80 h-80 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-neutral-900 border-2 border-amber-500/50 shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)]" onClick={handleUnbox}>
                    <div className="text-center space-y-4">
                        <Lock className="w-20 h-20 mx-auto text-amber-500" />
                        <p className="text-xl font-bold text-amber-500">Click to Open</p>
                    </div>
                </Card>
            </motion.div>

            {isUnboxing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
                >
                    <div className="text-4xl font-bold animate-pulse text-black dark:text-white">Unboxing...</div>
                </motion.div>
            )}
        </div>
    )
}
