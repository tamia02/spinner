import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        try {
            const cookieStore = await cookies()
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll()
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                        },
                    },
                }
            )
            const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error("Supabase exchange error:", error.message)
                return NextResponse.redirect(`${origin}/login?error=auth_failed`)
            }

            if (session?.user) {
                // Sync user to Prisma
                try {
                    await prisma.user.upsert({
                        where: { id: session.user.id },
                        update: { email: session.user.email || "" },
                        create: {
                            id: session.user.id,
                            email: session.user.email || "",
                            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User"
                        }
                    })
                } catch (dbError) {
                    console.error("Prisma sync error:", dbError)
                    // We still redirect to setup even if DB sync fails, 
                    // downstream components will handle missing DB user gracefully.
                }
                return NextResponse.redirect(`${origin}/setup`)
            }
        } catch (err) {
            console.error("Supabase callback exception:", err)
            return NextResponse.redirect(`${origin}/login?error=server_error`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
