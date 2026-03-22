import { NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://n8n-octavio-finsocio-back.w03d7r.easypanel.host/"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    const body = text ? JSON.parse(text) : {}
    return NextResponse.json(body, { status: res.status })
  } catch (err) {
    return NextResponse.json({ detail: "Register proxy error" }, { status: 500 })
  }
}

