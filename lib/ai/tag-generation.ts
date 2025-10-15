// lib/ai/tag-generation.ts
// 노트 내용 기반 자동 태그 생성 서비스
// Gemini API를 활용하여 노트 내용에서 관련성 높은 태그를 생성한다
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/types.ts, lib/ai/utils.ts

import { getGeminiClient } from './gemini-client'
import { GenerateTagsRequest, GenerateTagsResponse } from './types'
import { GeminiError, GeminiErrorType } from './errors'
import { estimateTokens, validateTokenLimit, truncateText } from './utils'

/**
 * 태그 생성 서비스 클래스
 */
export class TagGenerationService {
    private geminiClient = getGeminiClient()

    /**
     * 노트 내용에서 태그 생성
     * @param request 태그 생성 요청
     * @returns 생성된 태그 목록
     */
    async generateTags(
        request: GenerateTagsRequest
    ): Promise<GenerateTagsResponse> {
        const { content, maxTags = 6, model, maxTokens = 2000 } = request

        // 입력 검증
        if (!content || content.trim().length < 100) {
            throw new GeminiError(
                'INVALID_INPUT' as GeminiErrorType,
                '노트 내용이 100자 이상이어야 합니다',
                null
            )
        }

        // 토큰 제한 검증
        const inputTokens = estimateTokens(content)
        if (!validateTokenLimit(inputTokens, maxTokens)) {
            const truncated = truncateText(content, maxTokens)
            const truncatedTokens = estimateTokens(truncated)
            if (!validateTokenLimit(truncatedTokens, maxTokens)) {
                throw new GeminiError(
                    'TOKEN_LIMIT_EXCEEDED' as GeminiErrorType,
                    '토큰 제한을 초과했습니다',
                    null
                )
            }
            request = { ...request, content: truncated }
        }

        // 태그 생성 프롬프트 생성
        const prompt = this.createTagPrompt(request.content, maxTags)

        try {
            // Gemini API 호출
            const response = await this.geminiClient.generateText({
                prompt,
                model: model || 'gemini-2.0-flash-001',
                maxTokens,
                temperature: 0.3 // 일관된 태그 생성을 위해 낮은 온도
            })

            // 응답 파싱
            const tags = this.parseTagsResponse(response.text, maxTags)

            return {
                tags,
                model: response.model,
                inputTokens: response.inputTokens,
                outputTokens: response.outputTokens,
                finishReason: response.finishReason
            }
        } catch (error) {
            if (error instanceof GeminiError) {
                throw error
            }
            throw new GeminiError(
                'API_ERROR' as GeminiErrorType,
                `태그 생성 중 오류가 발생했습니다: ${
                    error instanceof Error ? error.message : '알 수 없는 오류'
                }`,
                error
            )
        }
    }

    /**
     * 태그 생성 프롬프트 생성
     * @param content 노트 내용
     * @param maxTags 최대 태그 수
     * @returns 프롬프트 문자열
     */
    private createTagPrompt(content: string, maxTags: number): string {
        return `다음 노트 내용을 분석하여 관련성 높은 태그를 최대 ${maxTags}개 생성해주세요.

요구사항:
1. 태그는 한국어로 작성
2. 각 태그는 2-10자 이내
3. 구체적이고 명확한 키워드 사용
4. 중복되지 않는 다양한 관점의 태그
5. JSON 배열 형태로 응답

노트 내용:
${content}

응답 형식:
["태그1", "태그2", "태그3"]`
    }

    /**
     * API 응답에서 태그 목록 파싱
     * @param response API 응답 텍스트
     * @param maxTags 최대 태그 수
     * @returns 파싱된 태그 목록
     */
    private parseTagsResponse(response: string, maxTags: number): string[] {
        try {
            // JSON 배열 형태 파싱 시도
            const jsonMatch = response.match(/\[([\s\S]*?)\]/)
            if (jsonMatch) {
                const jsonStr = `[${jsonMatch[1]}]`
                const parsed = JSON.parse(jsonStr)

                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(
                            tag =>
                                typeof tag === 'string' && tag.trim().length > 0
                        )
                        .map(tag => tag.trim())
                        .slice(0, maxTags)
                }
            }

            // JSON 파싱 실패 시 줄바꿈으로 분리된 태그 목록 파싱
            const lines = response.split('\n')
            const tags: string[] = []

            for (const line of lines) {
                const cleanLine = line.trim()
                if (
                    cleanLine &&
                    !cleanLine.startsWith('[') &&
                    !cleanLine.startsWith(']')
                ) {
                    // 따옴표 제거
                    const tag = cleanLine.replace(/^["']|["']$/g, '').trim()
                    if (tag && tag.length <= 10) {
                        tags.push(tag)
                        if (tags.length >= maxTags) break
                    }
                }
            }

            return tags.slice(0, maxTags)
        } catch (error) {
            console.error('태그 응답 파싱 오류:', error)
            return []
        }
    }
}

/**
 * 싱글톤 인스턴스 생성 및 반환
 */
let tagGenerationServiceInstance: TagGenerationService | null = null

export function getTagGenerationService(): TagGenerationService {
    if (!tagGenerationServiceInstance) {
        tagGenerationServiceInstance = new TagGenerationService()
    }
    return tagGenerationServiceInstance
}

/**
 * 서비스 인스턴스 재설정 (테스트용)
 */
export function resetTagGenerationService(): void {
    tagGenerationServiceInstance = null
}
