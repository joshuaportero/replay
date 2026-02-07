import { createClient } from '@/utils/supabase/server'
import SealMemoryForm from '@/components/SealMemoryForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, History, Shield, Clock, LogOut } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-neutral-50 dark:bg-neutral-950">

      {/* Header / Nav */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <History className="w-6 h-6 text-primary" /> LifeReplay
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </form>
          </div>
        ) : (
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </header>

      {user ? (
        <div className="w-full max-w-md space-y-8 mt-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">The Vault</h1>
            <p className="text-muted-foreground mt-2">Seal a memory for the future.</p>
          </div>
          <SealMemoryForm />
        </div>
      ) : (
        <div className="w-full max-w-5xl flex flex-col items-center text-center gap-8 mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-500 bg-clip-text text-transparent dark:from-neutral-100 dark:to-neutral-500">
            Send messages to the future.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            LifeReplay allows you to seal messages, videos, and memories today to be delivered to yourself or loved ones when the time is right.
          </p>

          <div className="flex gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
            {/* Features */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Secure & Private</h3>
              <p className="text-muted-foreground">Your memories are encrypted and stored securely until the reveal date.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Scheduled Delivery</h3>
              <p className="text-muted-foreground">Choose exact moments in the future to unlock your time capsules.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Preserve Legacy</h3>
              <p className="text-muted-foreground">Leave a lasting impact for your future self or loved ones.</p>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full max-w-5xl mt-24 border-t pt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} LifeReplay. Built with Next.js and Supabase.
      </footer>
    </main>
  )
}
