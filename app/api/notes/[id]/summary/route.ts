// app/api/notes/[id]/summary/route.ts
// 특정 노트에 대한 요약을 생성/조회/재생성하는 API 라우트
// 관련 파일: lib/ai/gemini-client.ts, lib/notes/queries.ts, lib/db/schema/summaries.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/connection'
import { notes } from '@/lib/db/schema/notes'
import { summaries } from '@/lib/db/schema/summaries'
import { eq } from 'drizzle-orm'
import { getGeminiClient } from '@/lib/ai/gemini-client'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const {
            data: { user },
            error
        } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const [note] = await db
            .select()
            .from(notes)
            .where(eq(notes.id, id))
            .limit(1)

        if (!note || note.userId !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Not found' },
                { status: 404 }
            )
        }

        const [summary] = await db
            .select()
            .from(summaries)
            .where(eq(summaries.noteId, id))
            .limit(1)

        return NextResponse.json({ success: true, summary: summary || null })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { regenerate } = await req
            .json()
            .then(v => v)
            .catch(() => ({ regenerate: false }))

        const supabase = await createClient()
        const {
            data: { user },
            error
        } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const [note] = await db
            .select()
            .from(notes)
            .where(eq(notes.id, id))
            .limit(1)

        if (!note || note.userId !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Not found' },
                { status: 404 }
            )
        }

        const client = getGeminiClient()

        // 프롬프트 설계: 3~6개의 불릿 포인트 요약
        const prompt = `다음 노트 내용을 간결하게 3~6개의 불릿 포인트로 한국어로 요약하시오. 각 불릿은 한 줄로 작성하고 불필요한 접두사는 제거하시오.\n\n노트 내용:\n${
            note.content || ''
        }`

        const result = await client.generateText({
            prompt,
            // 요약은 출력이 비교적 짧으므로 출력 토큰을 512로 제한
            maxTokens: 512,
            temperature: 0.4
        })

        // 기존 요약이 있고 regenerate=false면 그대로 유지
        const [existing] = await db
            .select()
            .from(summaries)
            .where(eq(summaries.noteId, id))
            .limit(1)

        if (existing && !regenerate) {
            return NextResponse.json({ success: true, summary: existing })
        }

        // upsert 요약
        if (existing) {
            await db
                .update(summaries)
                .set({ content: result.text, model: result.model })
                .where(eq(summaries.noteId, id))
        } else {
            await db.insert(summaries).values({
                noteId: id,
                model: result.model,
                content: result.text
            })
        }

        const [saved] = await db
            .select()
            .from(summaries)
            .where(eq(summaries.noteId, id))
            .limit(1)

        return NextResponse.json({ success: true, summary: saved })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
