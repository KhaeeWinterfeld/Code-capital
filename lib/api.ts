const BASE_URL = "https://n8n-octavio-finsocio-back.w03d7r.easypanel.host/";

async function buildPath(path: string, token: string | null): Promise<string> {
  let finalPath = path
  if (typeof window !== "undefined") {
    const number = localStorage.getItem("user_number")
    let userId = localStorage.getItem("user_id")
    const isJwt = token ? token.split(".").length === 3 : false
    if (!userId && number) {
      try {
        const ures = await fetch(`${BASE_URL}/users?number=${encodeURIComponent(number)}`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        if (ures.ok) {
          const user = await ures.json()
          if (user?.id) {
            userId = user.id
            localStorage.setItem("user_id", userId)
          }
        }
      } catch {}
    }
    if (userId && !isJwt) {
      const sep = finalPath.includes("?") ? "&" : "?"
      finalPath = `${finalPath}${sep}user_id=${encodeURIComponent(userId)}`
    }
  }
  return finalPath
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const finalPath = await buildPath(path, token)
  const baseHeaders = { "Content-Type": "application/json" }
  const mergedHeaders = {
    ...baseHeaders,
    ...(init?.headers as Record<string, string> | undefined || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${BASE_URL}${finalPath}`, {
    ...init,
    headers: mergedHeaders,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function authedDelete(path: string): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const finalPath = await buildPath(path, token)
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  return fetch(`${BASE_URL}${finalPath}`, { method: "DELETE", headers })
}

export type BackendCategory = { id: string; name: string };
export type BackendService = { id: string; name: string; category_id: string };
export type BackendTransaction = {
  id: string;
  client_id: string | null;
  service_id: string;
  is_expense: boolean;
  is_personal: boolean;
  pjpf: "pj" | "pf" | null;
  amount: number;
  description?: string | null;
  status: "pending" | "paid" | "cancelled";
  payment_method?: "pix" | "cash" | "card" | "transfer" | null;
  transaction_date: string;
  created_at: string;
};

export const api = {
  listCategories: () => request<BackendCategory[]>("/categories"),
  createCategory: (name: string) => request<BackendCategory>("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  }),
  deleteCategory: (id: string) => authedDelete(`/categories/${id}`),

  listServices: () => request<BackendService[]>("/services"),
  createService: (name: string, category_id: string) => request<BackendService>("/services", {
    method: "POST",
    body: JSON.stringify({ name, category_id }),
    headers: { "Content-Type": "application/json" },
  }),
  deleteService: (id: string) => authedDelete(`/services/${id}`),

  listTransactions: () => request<BackendTransaction[]>("/transactions"),
  createTransaction: (payload: {
    client_id?: string | null;
    service_id: string;
    is_expense: boolean;
    is_personal?: boolean;
    pjpf?: "pj" | "pf" | null;
    amount: number;
    description?: string | null;
    status?: "pending" | "paid" | "cancelled";
    payment_method?: "pix" | "cash" | "card" | "transfer" | null;
    transaction_date: string;
  }) => request<BackendTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  deleteTransaction: (id: string) => authedDelete(`/transactions/${id}`),
};
