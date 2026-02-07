'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, UploadCloud, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export default function SealMemoryForm() {
    const [content, setContent] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [loading, setLoading] = useState(false)
    const [revealUrl, setRevealUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date) return setError('Please select a delivery date')
        if (!content && !file) return setError('Please add a message or upload a file')

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in')

            let mediaUrl = null

            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Math.random()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('vault')
                    .upload(fileName, file)

                if (uploadError) throw uploadError
                mediaUrl = fileName
            }

            const { data, error: insertError } = await supabase
                .from('secrets')
                .insert({
                    user_id: user.id,
                    content,
                    media_url: mediaUrl,
                    delivery_date: date.toISOString(),
                })
                .select()
                .single()

            if (insertError) throw insertError

            setRevealUrl(`${window.location.origin}/reveal/${data.id}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (revealUrl) {
        return (
            <Card className="w-full max-w-lg mx-auto border-emerald-500/50 bg-emerald-500/5">
                <CardHeader>
                    <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> Memory Sealed!
                    </CardTitle>
                    <CardDescription>
                        Your time capsule has been secured. Share this link or keep it safe.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-background rounded-md border flex items-center justify-between gap-2">
                        <code className="text-sm truncate flex-1">{revealUrl}</code>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(revealUrl)}>
                            Copy
                        </Button>
                    </div>
                    <Button onClick={() => {
                        setRevealUrl(null)
                        setContent('')
                        setFile(null)
                        setDate(new Date())
                    }} className="w-full">
                        Seal Another Memory
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Seal a New Memory</CardTitle>
                <CardDescription>
                    Choose a date to deliver your message or file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            placeholder="Write a message to your future self..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="resize-none h-32"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attach Media (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="cursor-pointer file:text-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>Delivery Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <span className="animate-pulse">Sealing...</span> : 'Seal Memory'}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}
