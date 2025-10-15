// lib/db/schema/note-tags.ts
// 노트-태그 연결을 위한 Drizzle 스키마 정의
// 이 파일은 note_tags 테이블의 구조와 타입을 정의한다
// 관련 파일: lib/db/schema/tags.ts, lib/db/schema/notes.ts, lib/notes/queries.ts

import {
    pgTable,
    uuid,
    timestamp,
    primaryKey
} from 'drizzle-orm/pg-core'
import { notes } from './notes'
import { tags } from './tags'

export const noteTags = pgTable(
    'note_tags',
    {
        noteId: uuid('note_id')
            .notNull()
            .references(() => notes.id, { onDelete: 'cascade' }),
        tagId: uuid('tag_id')
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull()
    },
    table => ({
        // 복합 기본키
        pk: primaryKey({ columns: [table.noteId, table.tagId] })
    })
)

export type NoteTag = typeof noteTags.$inferSelect
export type NewNoteTag = typeof noteTags.$inferInsert
