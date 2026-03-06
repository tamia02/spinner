import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    let dbParsed: any = { error: 'not set' };
    try {
        const u = new URL(process.env.DATABASE_URL || '');
        dbParsed = { username: u.username, host: u.host, port: u.port, db: u.pathname };
    } catch { dbParsed = { error: 'parse_failed' }; }

    const report: any = {
        timestamp: new Date().toISOString(),
        db_connection_info: dbParsed,
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
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
            report.supabase.status = 'failed'
            report.supabase.error = error?.message || 'No user found'
        } else {
            report.supabase.status = 'connected'
            report.supabase.session = true
        }
    } catch (err: any) {
        report.supabase.status = 'failed'
        report.supabase.error = err.message
    }

    return NextResponse.json(report)
}
