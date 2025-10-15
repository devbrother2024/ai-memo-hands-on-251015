// lib/notes/tag-queries.ts
// 태그 관련 데이터베이스 쿼리 함수들
// 태그 CRUD, 노트-태그 연결, 필터링 기능을 제공한다
// 관련 파일: lib/db/schema/tags.ts, lib/db/schema/note-tags.ts, lib/db/connection.ts

import { eq, and, inArray, desc } from 'drizzle-orm'
import { db } from '../db/connection'
import { tags, type Tag, type NewTag } from '../db/schema/tags'
import { noteTags, type NoteTag, type NewNoteTag } from '../db/schema/note-tags'
import { notes, type Note } from '../db/schema/notes'

/**
 * 사용자의 모든 태그 조회
 * @param userId 사용자 ID
 * @returns 태그 목록
 */
export async function getTagsByUserId(userId: string): Promise<Tag[]> {
    try {
        return await db
            .select()
            .from(tags)
            .where(eq(tags.userId, userId))
            .orderBy(desc(tags.createdAt))
    } catch (error) {
        console.error('태그 조회 오류:', error)
        throw new Error('태그를 조회할 수 없습니다')
    }
}

/**
 * 노트의 태그 조회
 * @param noteId 노트 ID
 * @returns 태그 목록
 */
export async function getTagsByNoteId(noteId: string): Promise<Tag[]> {
    try {
        return await db
            .select({
                id: tags.id,
                name: tags.name,
                color: tags.color,
                userId: tags.userId,
                createdAt: tags.createdAt
            })
            .from(tags)
            .innerJoin(noteTags, eq(tags.id, noteTags.tagId))
            .where(eq(noteTags.noteId, noteId))
            .orderBy(tags.name)
    } catch (error) {
        console.error('노트 태그 조회 오류:', error)
        throw new Error('노트의 태그를 조회할 수 없습니다')
    }
}

/**
 * 태그명으로 태그 조회 (사용자별)
 * @param userId 사용자 ID
 * @param tagName 태그명
 * @returns 태그 또는 null
 */
export async function getTagByName(userId: string, tagName: string): Promise<Tag | null> {
    try {
        const result = await db
            .select()
            .from(tags)
            .where(and(eq(tags.userId, userId), eq(tags.name, tagName)))
            .limit(1)
        
        return result[0] || null
    } catch (error) {
        console.error('태그명으로 조회 오류:', error)
        throw new Error('태그를 조회할 수 없습니다')
    }
}

/**
 * 태그 생성
 * @param tagData 태그 데이터
 * @returns 생성된 태그
 */
export async function createTag(tagData: NewTag): Promise<Tag> {
    try {
        const result = await db
            .insert(tags)
            .values(tagData)
            .returning()
        
        return result[0]
    } catch (error) {
        console.error('태그 생성 오류:', error)
        throw new Error('태그를 생성할 수 없습니다')
    }
}

/**
 * 노트에 태그 연결
 * @param noteId 노트 ID
 * @param tagId 태그 ID
 * @returns 연결된 노트-태그 관계
 */
export async function connectNoteToTag(noteId: string, tagId: string): Promise<NoteTag> {
    try {
        const result = await db
            .insert(noteTags)
            .values({ noteId, tagId })
            .returning()
        
        return result[0]
    } catch (error) {
        console.error('노트-태그 연결 오류:', error)
        throw new Error('노트에 태그를 연결할 수 없습니다')
    }
}

/**
 * 노트의 모든 태그 연결 제거
 * @param noteId 노트 ID
 */
export async function removeAllTagsFromNote(noteId: string): Promise<void> {
    try {
        await db
            .delete(noteTags)
            .where(eq(noteTags.noteId, noteId))
    } catch (error) {
        console.error('노트 태그 제거 오류:', error)
        throw new Error('노트의 태그를 제거할 수 없습니다')
    }
}

/**
 * 태그별 노트 필터링
 * @param userId 사용자 ID
 * @param tagId 태그 ID
 * @returns 필터링된 노트 목록
 */
export async function getNotesByTagId(userId: string, tagId: string): Promise<Note[]> {
    try {
        return await db
            .select({
                id: notes.id,
                userId: notes.userId,
                title: notes.title,
                content: notes.content,
                createdAt: notes.createdAt,
                updatedAt: notes.updatedAt
            })
            .from(notes)
            .innerJoin(noteTags, eq(notes.id, noteTags.noteId))
            .where(and(eq(notes.userId, userId), eq(noteTags.tagId, tagId)))
            .orderBy(desc(notes.updatedAt))
    } catch (error) {
        console.error('태그별 노트 조회 오류:', error)
        throw new Error('태그별 노트를 조회할 수 없습니다')
    }
}

/**
 * 여러 태그로 노트 필터링 (OR 조건)
 * @param userId 사용자 ID
 * @param tagIds 태그 ID 목록
 * @returns 필터링된 노트 목록
 */
export async function getNotesByTagIds(userId: string, tagIds: string[]): Promise<Note[]> {
    if (tagIds.length === 0) {
        return []
    }

    try {
        return await db
            .select({
                id: notes.id,
                userId: notes.userId,
                title: notes.title,
                content: notes.content,
                createdAt: notes.createdAt,
                updatedAt: notes.updatedAt
            })
            .from(notes)
            .innerJoin(noteTags, eq(notes.id, noteTags.noteId))
            .where(and(eq(notes.userId, userId), inArray(noteTags.tagId, tagIds)))
            .orderBy(desc(notes.updatedAt))
    } catch (error) {
        console.error('다중 태그별 노트 조회 오류:', error)
        throw new Error('태그별 노트를 조회할 수 없습니다')
    }
}

/**
 * 태그 사용 횟수 조회
 * @param userId 사용자 ID
 * @returns 태그별 사용 횟수
 */
export async function getTagUsageCounts(userId: string): Promise<Array<{ tagId: string; tagName: string; count: number }>> {
    try {
        const result = await db
            .select({
                tagId: tags.id,
                tagName: tags.name,
                count: noteTags.noteId
            })
            .from(tags)
            .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
            .where(eq(tags.userId, userId))
            .groupBy(tags.id, tags.name)
            .orderBy(desc(tags.createdAt))

        return result.map(row => ({
            tagId: row.tagId,
            tagName: row.tagName,
            count: row.count ? 1 : 0
        }))
    } catch (error) {
        console.error('태그 사용 횟수 조회 오류:', error)
        throw new Error('태그 사용 횟수를 조회할 수 없습니다')
    }
}
