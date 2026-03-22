const BASE_URL = "https://n8n-octavio-finsocio-back.w03d7r.easypanel.host"

const TOKEN_KEY = "access_token"

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
  try {
    const parts = token.split(".")
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
      const sub = typeof payload?.sub === "string" ? payload.sub : null
      if (sub) localStorage.setItem("user_id", sub)
    }
  } catch {}
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const paths = ["/auth/login", "/login"]
  let lastErr: string | null = null
  for (const p of paths) {
    const res = await fetch(`${BASE_URL}${p}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) return res.json()
    lastErr = await res.text()
  }
  throw new Error(lastErr || "Login failed")
}

export async function register(user: string, password: string, phone: string): Promise<{ access_token: string }> {
  const paths = ["/auth/register"]
  const payload = { username: user, password, number: phone }
  let lastErr: string | null = null
  for (const p of paths) {
    const res = await fetch(`${BASE_URL}${p}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) return res.json()
    lastErr = await res.text()
  }
  throw new Error(lastErr || "Registration failed")
}
