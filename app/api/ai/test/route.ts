// app/api/ai/test/route.ts
// Gemini API 테스트를 위한 API 라우트
// 간단한 텍스트 생성 및 헬스체크 기능 제공
// 관련 파일: lib/ai/gemini-client.ts, app/test-ai/page.tsx

import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/ai/gemini-client'
import { GeminiError } from '@/lib/ai/errors'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { prompt, action } = body

        const client = getGeminiClient()

        // 헬스체크 액션
        if (action === 'healthcheck') {
            const result = await client.healthCheckDetailed()
            return NextResponse.json({
                success: true,
                data: result
            })
        }

        // 텍스트 생성 액션
        if (action === 'generate') {
            if (!prompt) {
                return NextResponse.json(
                    { success: false, error: '프롬프트를 입력해주세요' },
                    { status: 400 }
                )
            }

            const result = await client.generateText({ prompt })

            return NextResponse.json({
                success: true,
                data: {
                    text: result.text,
                    model: result.model,
                    inputTokens: result.inputTokens,
                    outputTokens: result.outputTokens,
                    totalTokens: result.inputTokens + result.outputTokens
                }
            })
        }

        // 토큰 계산 액션
        if (action === 'estimate') {
            if (!prompt) {
                return NextResponse.json(
                    { success: false, error: '텍스트를 입력해주세요' },
                    { status: 400 }
                )
            }

            const tokens = client.estimateTokens(prompt)
            const isValid = client.validateTokenLimit(tokens)

            return NextResponse.json({
                success: true,
                data: {
                    text: prompt,
                    estimatedTokens: tokens,
                    isWithinLimit: isValid,
                    maxTokens: 8192
                }
            })
        }

        return NextResponse.json(
            { success: false, error: '알 수 없는 액션입니다' },
            { status: 400 }
        )
    } catch (error) {
        console.error('API Test Error:', error)

        if (error instanceof GeminiError) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.getUserMessage(),
                    errorType: error.type,
                    details: error.message
                },
                { status: error.statusCode || 500 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: '서버 오류가 발생했습니다',
                details:
                    error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Gemini API Test Endpoint',
        endpoints: {
            healthcheck: 'POST /api/ai/test with { action: "healthcheck" }',
            generate:
                'POST /api/ai/test with { action: "generate", prompt: "..." }',
            estimate:
                'POST /api/ai/test with { action: "estimate", prompt: "..." }'
        }
    })
}
