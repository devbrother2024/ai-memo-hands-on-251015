// lib/db/schema/tags.ts
// 태그 저장을 위한 Drizzle 스키마 정의
// 이 파일은 tags 테이블의 구조와 타입을 정의한다
// 관련 파일: lib/db/schema/note-tags.ts, lib/notes/queries.ts, components/notes/tags-section.tsx

import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const tags = pgTable(
    'tags',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: text('name').notNull(),
        color: text('color').notNull().default('#3b82f6'), // 기본 파란색
        userId: uuid('user_id').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull()
    },
    table => ({
        // 사용자별 태그명 중복 방지
        uniqueUserTag: uniqueIndex('tags_user_name_unique').on(
            table.userId,
            table.name
        )
    })
)

// Zod 스키마 자동 생성
export const insertTagSchema = createInsertSchema(tags, {
    name: z =>
        z
            .min(1, '태그명을 입력해주세요')
            .max(50, '태그명은 50자 이내로 입력해주세요'),
    color: z => z.regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요')
})

export const selectTagSchema = createSelectSchema(tags)

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
