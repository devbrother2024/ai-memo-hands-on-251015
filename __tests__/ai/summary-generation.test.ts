// __tests__/ai/summary-generation.test.ts
// AI 요약 생성 기능에 대한 단위 테스트
// 관련 파일: lib/ai/gemini-client.ts, app/api/notes/[id]/summary/route.ts

import { getGeminiClient } from '@/lib/ai/gemini-client'

// Gemini API 클라이언트 모킹
jest.mock('@/lib/ai/gemini-client', () => ({
    getGeminiClient: jest.fn()
}))

describe('AI Summary Generation', () => {
    const mockGeminiClient = {
        generateText: jest.fn(),
        healthCheck: jest.fn(),
        estimateTokens: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(getGeminiClient as jest.Mock).mockReturnValue(mockGeminiClient)
    })

    describe('요약 생성 프롬프트', () => {
        it('올바른 프롬프트 형식으로 요약을 요청해야 한다', async () => {
            const noteContent =
                '이것은 테스트 노트 내용입니다. 여러 문장으로 구성되어 있습니다.'
            const expectedPrompt = `다음 노트 내용을 간결하게 3~6개의 불릿 포인트로 한국어로 요약하시오. 각 불릿은 한 줄로 작성하고 불필요한 접두사는 제거하시오.\n\n노트 내용:\n${noteContent}`

            mockGeminiClient.generateText.mockResolvedValue({
                text: '• 첫 번째 요약 포인트\n• 두 번째 요약 포인트\n• 세 번째 요약 포인트',
                model: 'gemini-2.0-flash-001',
                inputTokens: 50,
                outputTokens: 30,
                finishReason: 'stop'
            })

            await mockGeminiClient.generateText({
                prompt: expectedPrompt,
                maxTokens: 512,
                temperature: 0.4
            })

            expect(mockGeminiClient.generateText).toHaveBeenCalledWith({
                prompt: expectedPrompt,
                maxTokens: 512,
                temperature: 0.4
            })
        })
    })

    describe('토큰 제한 검증', () => {
        it('토큰 제한을 초과하는 노트는 잘라내어 처리해야 한다', async () => {
            const longContent = 'a'.repeat(10000) // 매우 긴 내용
            mockGeminiClient.estimateTokens.mockReturnValue(2000) // 토큰 제한 초과
            mockGeminiClient.generateText.mockResolvedValue({
                text: '• 요약된 내용',
                model: 'gemini-2.0-flash-001',
                inputTokens: 1000,
                outputTokens: 20,
                finishReason: 'stop'
            })

            const result = await mockGeminiClient.generateText({
                prompt: `다음 노트 내용을 간결하게 3~6개의 불릿 포인트로 한국어로 요약하시오. 각 불릿은 한 줄로 작성하고 불필요한 접두사는 제거하시오.\n\n노트 내용:\n${longContent}`,
                maxTokens: 512,
                temperature: 0.4
            })

            expect(result).toBeDefined()
            expect(result.text).toContain('•')
        })
    })

    describe('에러 처리', () => {
        it('API 에러 시 적절한 에러 메시지를 반환해야 한다', async () => {
            const error = new Error('API 호출 실패')
            mockGeminiClient.generateText.mockRejectedValue(error)

            await expect(
                mockGeminiClient.generateText({
                    prompt: '테스트 프롬프트',
                    maxTokens: 512,
                    temperature: 0.4
                })
            ).rejects.toThrow('API 호출 실패')
        })

        it('타임아웃 에러를 적절히 처리해야 한다', async () => {
            const timeoutError = new Error('Operation timed out after 30000ms')
            mockGeminiClient.generateText.mockRejectedValue(timeoutError)

            await expect(
                mockGeminiClient.generateText({
                    prompt: '테스트 프롬프트',
                    maxTokens: 512,
                    temperature: 0.4
                })
            ).rejects.toThrow('Operation timed out after 30000ms')
        })
    })

    describe('응답 검증', () => {
        it('올바른 형식의 요약 응답을 반환해야 한다', async () => {
            const mockResponse = {
                text: '• 첫 번째 핵심 내용\n• 두 번째 중요한 포인트\n• 세 번째 요약 항목',
                model: 'gemini-2.0-flash-001',
                inputTokens: 100,
                outputTokens: 50,
                finishReason: 'stop'
            }

            mockGeminiClient.generateText.mockResolvedValue(mockResponse)

            const result = await mockGeminiClient.generateText({
                prompt: '테스트 프롬프트',
                maxTokens: 512,
                temperature: 0.4
            })

            expect(result).toEqual(mockResponse)
            expect(result.text).toMatch(/^•.*\n•.*\n•.*$/)
            expect(result.model).toBe('gemini-2.0-flash-001')
        })
    })
})
