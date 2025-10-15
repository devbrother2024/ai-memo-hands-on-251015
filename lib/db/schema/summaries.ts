// lib/db/schema/summaries.ts
// 노트 요약 저장을 위한 Drizzle 스키마 정의
// 이 파일은 summaries 테이블의 구조와 타입을 정의한다
// 관련 파일: lib/db/schema/notes.ts, lib/notes/queries.ts, app/api/notes/[id]/summary/route.ts

import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { notes } from './notes'

export const summaries = pgTable(
    'summaries',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        noteId: uuid('note_id')
            .notNull()
            .references(() => notes.id, { onDelete: 'cascade' }),
        model: text('model').notNull().default('gemini-2.0-flash-001'),
        content: text('content').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull()
    },
    table => ({
        // 한 노트당 하나의 요약만 유지
        uniqueNote: uniqueIndex('summaries_note_unique').on(table.noteId)
    })
)

export type Summary = typeof summaries.$inferSelect
export type NewSummary = typeof summaries.$inferInsert

