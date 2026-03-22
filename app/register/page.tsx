"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/auth"
import { Wallet, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const disabled = useMemo(() => {
    const basic = !user || !password || !phone || loading
    const match = confirm ? password === confirm : true
    return basic || !match
  }, [user, password, phone, confirm, loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await register(user.trim(), password, phone)
      if (typeof window !== "undefined") {
        localStorage.setItem("user_number", phone.trim())
      }
      router.replace("/login")
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "Registration failed"
      setError(msg.includes("409") ? "User already exists" : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground text-lg tracking-tight">FinSócio</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-primary shadow-[0_0_24px_#5864FF] p-6" suppressHydrationWarning>
          <div className="mb-4">
            <h1 className="text-base font-semibold text-foreground">Create account</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sign up to start your business dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">User</label>
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="yourbusiness"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="any format"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-danger">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger-muted/30 border border-danger/40 rounded-md px-3 py-2">{error}</div>
            )}
            {success && (
              <div className="text-xs text-success bg-success-muted/30 border border-success/40 rounded-md px-3 py-2">{success}</div>
            )}

            <button
              type="submit"
              disabled={disabled}
              className={cn(
                "mt-1 w-full rounded-xl py-3 text-sm font-semibold transition-all focus:outline-none",
                disabled
                  ? "bg-[#5864FF]/60 text-white cursor-not-allowed"
                  : "bg-[#5864FF] text-white hover:opacity-90 active:scale-95 shadow-[0_0_16px_#5864FF] focus:ring-2 focus:ring-[#5864FF]"
              )}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="text-xs text-muted-foreground text-center mt-1">
              Already have an account? <Link href="/login" className="text-primary hover:opacity-80">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
