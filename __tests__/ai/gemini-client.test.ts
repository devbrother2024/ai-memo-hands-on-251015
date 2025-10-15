// __tests__/ai/gemini-client.test.ts
// Gemini 클라이언트 단위 테스트
// API 호출, 에러 처리, 헬스체크, 토큰 계산 등의 기능 테스트
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/utils.ts

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { GeminiClient, resetGeminiClient } from '../../lib/ai/gemini-client'
import { GeminiError, GeminiErrorType } from '../../lib/ai/errors'
import { estimateTokens, validateTokenLimit } from '../../lib/ai/utils'

// GoogleGenAI 모킹
const mockGenerateContent = jest.fn()

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: mockGenerateContent
        }
    }))
}))

describe('GeminiClient', () => {
    let client: GeminiClient

    beforeEach(() => {
        // 환경변수 설정
        process.env.GOOGLE_API_KEY = 'test-api-key'
        process.env.GEMINI_MODEL = 'gemini-2.5-flash'
        process.env.GEMINI_MAX_TOKENS = '8192'
        process.env.GEMINI_TIMEOUT_MS = '10000'

        // 모킹 초기화
        mockGenerateContent.mockClear()

        // 클라이언트 리셋
        resetGeminiClient()

        client = new GeminiClient()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('초기화', () => {
        test('올바른 설정으로 초기화되어야 한다', () => {
            expect(client).toBeDefined()
            const config = client.getConfig()
            expect(config.model).toBe('gemini-2.5-flash')
            expect(config.maxTokens).toBe(8192)
            expect(config.timeout).toBe(10000)
            expect(config.apiKey).toMatch(/test-api.../)
        })

        test('API 키가 없으면 에러를 발생시켜야 한다', () => {
            delete process.env.GOOGLE_API_KEY
            expect(() => new GeminiClient()).toThrow(
                'GOOGLE_API_KEY is required'
            )
        })
    })

    describe('텍스트 생성', () => {
        test('성공적으로 텍스트를 생성해야 한다', async () => {
            const mockResponse = {
                text: '안녕하세요! 테스트 응답입니다.'
            }
            mockGenerateContent.mockResolvedValue(mockResponse)

            const result = await client.generateText({
                prompt: '안녕하세요'
            })

            expect(result.text).toBe(mockResponse.text)
            expect(result.model).toBe('gemini-2.5-flash')
            expect(result.inputTokens).toBeGreaterThan(0)
            expect(result.outputTokens).toBeGreaterThan(0)
            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: '안녕하세요',
                config: {
                    maxOutputTokens: 8192,
                    temperature: 0.7
                }
            })
        })

        test('토큰 제한을 초과하면 에러를 발생시켜야 한다', async () => {
            const longText = 'a'.repeat(50000)

            await expect(
                client.generateText({
                    prompt: longText
                })
            ).rejects.toThrow(GeminiError)
        })

        test('API 에러를 적절히 처리해야 한다', async () => {
            const apiError = new Error('API key invalid')
            apiError.status = 401
            mockGenerateContent.mockRejectedValue(apiError)

            await expect(
                client.generateText({
                    prompt: '테스트'
                })
            ).rejects.toThrow(GeminiError)
        })

        test('빈 응답을 처리해야 한다', async () => {
            mockGenerateContent.mockResolvedValue({ text: '' })

            await expect(
                client.generateText({
                    prompt: '테스트'
                })
            ).rejects.toThrow('Empty response from Gemini API')
        })
    })

    describe('헬스체크', () => {
        test('성공적인 헬스체크를 수행해야 한다', async () => {
            // 헬스체크는 내부적으로 generateText를 호출하므로 모킹 설정
            const mockResponse = {
                text: 'Hello response'
            }
            mockGenerateContent.mockResolvedValueOnce(mockResponse)

            const result = await client.healthCheck()
            expect(result).toBe(true)
            expect(mockGenerateContent).toHaveBeenCalled()
        })

        test('실패한 헬스체크를 처리해야 한다', async () => {
            mockGenerateContent.mockRejectedValueOnce(
                new Error('Network error')
            )

            const result = await client.healthCheck()
            expect(result).toBe(false)
        })

        test('상세한 헬스체크 결과를 반환해야 한다', async () => {
            const mockResponse = {
                text: 'Hello response'
            }
            mockGenerateContent.mockResolvedValueOnce(mockResponse)

            const result = await client.healthCheckDetailed()
            expect(result.success).toBe(true)
            expect(result.latencyMs).toBeGreaterThanOrEqual(0)
            expect(result.timestamp).toBeInstanceOf(Date)
        })
    })

    describe('토큰 관리', () => {
        test('토큰 수를 정확히 추정해야 한다', () => {
            const text = '안녕하세요 테스트입니다'
            const tokens = client.estimateTokens(text)
            expect(tokens).toBeGreaterThan(0)
            expect(typeof tokens).toBe('number')
        })

        test('토큰 제한을 올바르게 검증해야 한다', () => {
            expect(client.validateTokenLimit(100)).toBe(true)
            expect(client.validateTokenLimit(10000)).toBe(false)
        })

        test('텍스트를 토큰 제한에 맞게 잘라야 한다', () => {
            const longText = '안녕하세요 '.repeat(1000)
            const truncated = client.truncateToTokenLimit(longText, 100)

            expect(truncated.length).toBeLessThan(longText.length)
            expect(client.estimateTokens(truncated)).toBeLessThanOrEqual(100)
        })
    })

    describe('설정 관리', () => {
        test('설정을 업데이트할 수 있어야 한다', () => {
            const newConfig = {
                model: 'gemini-pro',
                maxTokens: 4096
            }

            client.updateConfig(newConfig)
            const config = client.getConfig()

            expect(config.model).toBe('gemini-pro')
            expect(config.maxTokens).toBe(4096)
        })

        test('API 키 변경 시 클라이언트를 재초기화해야 한다', () => {
            const newApiKey = 'new-test-api-key'
            client.updateConfig({ apiKey: newApiKey })

            const config = client.getConfig()
            expect(config.apiKey).toMatch(/new-test.../)
        })
    })
})

describe('유틸리티 함수', () => {
    describe('estimateTokens', () => {
        test('영문 텍스트의 토큰을 추정해야 한다', () => {
            const englishText = 'Hello world, this is a test.'
            const tokens = estimateTokens(englishText)
            expect(tokens).toBeGreaterThan(0)
            expect(tokens).toBeLessThan(englishText.length)
        })

        test('한글 텍스트의 토큰을 추정해야 한다', () => {
            const koreanText = '안녕하세요, 이것은 테스트입니다.'
            const tokens = estimateTokens(koreanText)
            expect(tokens).toBeGreaterThan(0)
        })

        test('빈 문자열은 0 토큰이어야 한다', () => {
            expect(estimateTokens('')).toBe(0)
        })
    })

    describe('validateTokenLimit', () => {
        test('제한 내의 토큰은 통과해야 한다', () => {
            expect(validateTokenLimit(1000, 8192)).toBe(true)
        })

        test('제한을 초과하는 토큰은 실패해야 한다', () => {
            expect(validateTokenLimit(7000, 8192)).toBe(false)
        })

        test('기본 제한값을 사용해야 한다', () => {
            expect(validateTokenLimit(1000)).toBe(true)
            expect(validateTokenLimit(7000)).toBe(false)
        })
    })
})
