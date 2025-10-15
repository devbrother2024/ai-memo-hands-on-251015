// lib/ai/actions.ts
// AI 관련 Server Actions
// 요약 생성, 태그 생성 등의 서버 액션을 제공한다
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/tag-generation.ts, lib/notes/queries.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerUser } from '../auth/actions'
import { getTagGenerationService } from './tag-generation'
import { 
    getTagsByNoteId, 
    createTag, 
    connectNoteToTag, 
    removeAllTagsFromNote,
    getTagByName 
} from '../notes/tag-queries'
import { GeminiError } from './errors'

/**
 * 노트에 태그 생성 및 연결
 * @param noteId 노트 ID
 * @param content 노트 내용
 * @returns 성공/실패 결과
 */
export async function generateTagsForNote(
    noteId: string,
    content: string
): Promise<{ success: boolean; error?: string; tags?: string[] }> {
    try {
        // 사용자 인증 확인
        const user = await getServerUser()
        if (!user) {
            return { success: false, error: '로그인이 필요합니다' }
        }

        // 입력 검증
        if (!noteId || !content || content.trim().length < 100) {
            return { 
                success: false, 
                error: '노트 내용이 100자 이상이어야 합니다' 
            }
        }

        // 기존 태그 제거
        await removeAllTagsFromNote(noteId)

        // 태그 생성 서비스 호출
        const tagService = getTagGenerationService()
        const result = await tagService.generateTags({
            content,
            maxTags: 6
        })

        if (result.tags.length === 0) {
            return { 
                success: false, 
                error: '태그를 생성할 수 없습니다' 
            }
        }

        // 태그 생성 및 연결
        const createdTags: string[] = []
        for (const tagName of result.tags) {
            try {
                // 기존 태그 확인
                let tag = await getTagByName(user.id, tagName)
                
                if (!tag) {
                    // 새 태그 생성
                    const tagData = {
                        name: tagName,
                        color: getRandomTagColor(),
                        userId: user.id
                    }
                    tag = await createTag(tagData)
                }

                // 노트와 태그 연결
                await connectNoteToTag(noteId, tag.id)
                createdTags.push(tagName)
            } catch (error) {
                console.error(`태그 "${tagName}" 생성/연결 오류:`, error)
                // 개별 태그 오류는 무시하고 계속 진행
            }
        }

        if (createdTags.length === 0) {
            return { 
                success: false, 
                error: '태그를 생성할 수 없습니다' 
            }
        }

        // 캐시 무효화
        revalidatePath(`/notes/${noteId}`)
        revalidatePath('/notes')

        return { 
            success: true, 
            tags: createdTags 
        }

    } catch (error) {
        console.error('태그 생성 오류:', error)
        
        if (error instanceof GeminiError) {
            return { 
                success: false, 
                error: error.message 
            }
        }

        return { 
            success: false, 
            error: '태그 생성 중 오류가 발생했습니다' 
        }
    }
}

/**
 * 노트의 태그 재생성
 * @param noteId 노트 ID
 * @param content 노트 내용
 * @returns 성공/실패 결과
 */
export async function regenerateTagsForNote(
    noteId: string,
    content: string
): Promise<{ success: boolean; error?: string; tags?: string[] }> {
    return generateTagsForNote(noteId, content)
}

/**
 * 랜덤 태그 색상 생성
 * @returns 색상 코드
 */
function getRandomTagColor(): string {
    const colors = [
        '#3b82f6', // 파란색
        '#ef4444', // 빨간색
        '#10b981', // 초록색
        '#f59e0b', // 주황색
        '#8b5cf6', // 보라색
        '#06b6d4', // 청록색
        '#84cc16', // 라임색
        '#f97316', // 오렌지색
        '#ec4899', // 핑크색
        '#6b7280'  // 회색
    ]
    
    return colors[Math.floor(Math.random() * colors.length)]
}
