// __tests__/ai/tag-generation.test.ts
// 태그 생성 서비스 단위 테스트
// Gemini API 호출, 응답 파싱, 에러 처리 기능을 테스트한다
// 관련 파일: lib/ai/tag-generation.ts, lib/ai/gemini-client.ts

import { TagGenerationService } from '@/lib/ai/tag-generation'
import { getGeminiClient } from '@/lib/ai/gemini-client'

// Gemini 클라이언트 모킹
jest.mock('@/lib/ai/gemini-client')
const mockGeminiClient = getGeminiClient as jest.MockedFunction<typeof getGeminiClient>

describe('TagGenerationService', () => {
    let tagService: TagGenerationService
    let mockClient: any

    beforeEach(() => {
        // 모킹된 클라이언트 설정
        mockClient = {
            generateText: jest.fn()
        }
        mockGeminiClient.mockReturnValue(mockClient)
        
        tagService = new TagGenerationService()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('generateTags', () => {
        it('정상적인 태그 생성', async () => {
            // Given
            const content = '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩에 관한 내용입니다.'
            const mockResponse = {
                text: '["개발", "프로그래밍", "코딩", "테스트"]',
                model: 'gemini-2.0-flash-001',
                inputTokens: 50,
                outputTokens: 20,
                finishReason: 'stop'
            }
            mockClient.generateText.mockResolvedValue(mockResponse)

            // When
            const result = await tagService.generateTags({
                content,
                maxTags: 4
            })

            // Then
            expect(result.tags).toEqual(['개발', '프로그래밍', '코딩', '테스트'])
            expect(result.model).toBe('gemini-2.0-flash-001')
            expect(mockClient.generateText).toHaveBeenCalledWith({
                prompt: expect.stringContaining('태그를 최대 4개 생성해주세요'),
                model: 'gemini-2.0-flash-001',
                maxTokens: 2000,
                temperature: 0.3
            })
        })

        it('최대 태그 수 제한', async () => {
            // Given
            const content = '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩, 테스트, 디버깅, 리팩토링에 관한 내용입니다.'
            const mockResponse = {
                text: '["개발", "프로그래밍", "코딩", "테스트", "디버깅", "리팩토링", "추가태그"]',
                model: 'gemini-2.0-flash-001',
                inputTokens: 50,
                outputTokens: 30,
                finishReason: 'stop'
            }
            mockClient.generateText.mockResolvedValue(mockResponse)

            // When
            const result = await tagService.generateTags({
                content,
                maxTags: 3
            })

            // Then
            expect(result.tags).toHaveLength(3)
            expect(result.tags).toEqual(['개발', '프로그래밍', '코딩'])
        })

        it('100자 미만 내용 시 에러', async () => {
            // Given
            const content = '짧은 내용'

            // When & Then
            await expect(tagService.generateTags({ content })).rejects.toThrow('노트 내용이 100자 이상이어야 합니다')
        })

        it('API 에러 처리', async () => {
            // Given
            const content = '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩에 관한 내용입니다.'
            mockClient.generateText.mockRejectedValue(new Error('API Error'))

            // When & Then
            await expect(tagService.generateTags({ content })).rejects.toThrow('태그 생성 중 오류가 발생했습니다')
        })

        it('빈 응답 처리', async () => {
            // Given
            const content = '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩에 관한 내용입니다.'
            const mockResponse = {
                text: '',
                model: 'gemini-2.0-flash-001',
                inputTokens: 50,
                outputTokens: 0,
                finishReason: 'stop'
            }
            mockClient.generateText.mockResolvedValue(mockResponse)

            // When
            const result = await tagService.generateTags({ content })

            // Then
            expect(result.tags).toEqual([])
        })

        it('JSON 파싱 실패 시 줄바꿈으로 파싱', async () => {
            // Given
            const content = '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩에 관한 내용입니다.'
            const mockResponse = {
                text: '개발\n프로그래밍\n코딩',
                model: 'gemini-2.0-flash-001',
                inputTokens: 50,
                outputTokens: 20,
                finishReason: 'stop'
            }
            mockClient.generateText.mockResolvedValue(mockResponse)

            // When
            const result = await tagService.generateTags({ content })

            // Then
            expect(result.tags).toEqual(['개발', '프로그래밍', '코딩'])
        })
    })

    describe('createTagPrompt', () => {
        it('프롬프트 생성 확인', () => {
            // Given
            const content = '테스트 내용'
            const maxTags = 5

            // When
            const prompt = (tagService as any).createTagPrompt(content, maxTags)

            // Then
            expect(prompt).toContain('최대 5개 생성해주세요')
            expect(prompt).toContain('테스트 내용')
            expect(prompt).toContain('JSON 배열 형태로 응답')
        })
    })

    describe('parseTagsResponse', () => {
        it('JSON 배열 파싱', () => {
            // Given
            const response = '["개발", "프로그래밍", "코딩"]'
            const maxTags = 3

            // When
            const tags = (tagService as any).parseTagsResponse(response, maxTags)

            // Then
            expect(tags).toEqual(['개발', '프로그래밍', '코딩'])
        })

        it('빈 문자열 필터링', () => {
            // Given
            const response = '["개발", "", "코딩", "   "]'
            const maxTags = 5

            // When
            const tags = (tagService as any).parseTagsResponse(response, maxTags)

            // Then
            expect(tags).toEqual(['개발', '코딩'])
        })

        it('긴 태그명 필터링', () => {
            // Given
            const response = '["개발", "매우긴태그명입니다", "코딩"]'
            const maxTags = 5

            // When
            const tags = (tagService as any).parseTagsResponse(response, maxTags)

            // Then
            expect(tags).toEqual(['개발', '코딩'])
        })
    })
})
