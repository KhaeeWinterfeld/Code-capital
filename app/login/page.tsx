"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { login, getToken, setToken } from "@/lib/auth"
import { Wallet, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Não redireciona automaticamente ao acessar /login
  }, [])

  const disabled = useMemo(() => loading || !username || !password || !phone, [loading, username, password, phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    setLoading(true)
    setError("")
    try {
      const res = await login(username.trim(), password)
      setToken(res.access_token)
      if (typeof window !== "undefined") {
        localStorage.setItem("user_number", phone.trim())
      }
      router.replace("/")
    } catch (err) {
      setError("Invalid credentials")
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

        <div className="bg-card rounded-2xl border border-primary shadow-[0_0_24px_#5864FF] p-6">
          <div className="mb-4">
            <h1 className="text-base font-semibold text-foreground">Sign in</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sign in to access your financial dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="yourname"
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="cell number"
              />
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger-muted/30 border border-danger/40 rounded-md px-3 py-2">{error}</div>
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
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
