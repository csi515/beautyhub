import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnv } from '@/app/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { access_token?: string; refresh_token?: string; expires_in?: number; remember?: boolean }
    const { access_token, refresh_token, expires_in, remember } = body
    if (!access_token) {
      return NextResponse.json({ message: 'token required' }, { status: 400 })
    }

    const url = getEnv.supabaseUrl()
    const anon = getEnv.supabaseAnonKey()

    if (!url || !anon) {
      console.error('Supabase environment variables not configured for session route')
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(url, anon)
    const { data, error } = await supabase.auth.getUser(access_token)

    if (error || !data.user) {
      return NextResponse.json({ message: error?.message || 'invalid token' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    const secure = process.env.NODE_ENV === 'production'

    const accessTokenMaxAge = expires_in || (remember ? 60 * 60 * 24 * 7 : 60 * 60)
    res.cookies.set('sb:token', access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: accessTokenMaxAge,
    })

    if (refresh_token) {
      const refreshTokenMaxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
      res.cookies.set('sb:refresh', refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: refreshTokenMaxAge,
      })
    }

    return res
  } catch (e: unknown) {
    console.error('Session route error:', e)
    const message = e instanceof Error ? e.message : 'bad request'
    return NextResponse.json({ message }, { status: 400 })
  }
}


