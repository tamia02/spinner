import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        env: {
            database_url: !!process.env.DATABASE_URL,
            supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            node_env: process.env.NODE_ENV
        },
        database: {
            status: 'unknown',
            error: null
        },
        supabase: {
            status: 'unknown',
            error: null
        }
    }

    // Check Prisma
    try {
        await prisma.user.count()
        report.database.status = 'connected'
    } catch (err: any) {
        report.database.status = 'failed'
        report.database.error = err.message
    }

    // Check Supabase
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getSession()
        if (error) {
            report.supabase.status = 'failed'
            report.supabase.error = error.message
        } else {
            report.supabase.status = 'connected'
            report.supabase.session = !!data.session
        }
    } catch (err: any) {
        report.supabase.status = 'failed'
        report.supabase.error = err.message
    }

    return NextResponse.json(report)
}
