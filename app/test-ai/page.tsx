// app/test-ai/page.tsx
// Gemini API 테스트 UI 페이지
// API 연결 상태, 텍스트 생성, 토큰 계산 등을 테스트할 수 있는 인터페이스 제공
// 관련 파일: app/api/ai/test/route.ts, lib/ai/gemini-client.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function TestAIPage() {
    const [prompt, setPrompt] = useState('')
    const [result, setResult] = useState<{
        success: boolean
        data?: {
            success?: boolean
            latencyMs?: number
            timestamp?: string
            text?: string
            model?: string
            inputTokens?: number
            outputTokens?: number
            totalTokens?: number
            estimatedTokens?: number
            maxTokens?: number
            isWithinLimit?: boolean
        }
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleTest = async (action: string) => {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch('/api/ai/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    prompt: prompt.trim()
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '요청 실패')
            }

            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">🤖 Gemini API 테스트</h1>

            {/* 헬스체크 섹션 */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    1. API 연결 상태 확인
                </h2>
                <Button
                    onClick={() => handleTest('healthcheck')}
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    {loading ? '확인 중...' : '헬스체크 실행'}
                </Button>
            </Card>

            {/* 텍스트 생성 섹션 */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    2. 텍스트 생성 테스트
                </h2>
                <Textarea
                    placeholder="생성할 텍스트에 대한 프롬프트를 입력하세요&#10;예: 인공지능의 장점 3가지를 설명해주세요"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="mb-4 min-h-32"
                />
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleTest('generate')}
                        disabled={loading || !prompt.trim()}
                        variant="default"
                    >
                        {loading ? '생성 중...' : '텍스트 생성'}
                    </Button>
                    <Button
                        onClick={() => handleTest('estimate')}
                        disabled={loading || !prompt.trim()}
                        variant="outline"
                    >
                        {loading ? '계산 중...' : '토큰 수 계산'}
                    </Button>
                </div>
            </Card>

            {/* 결과 표시 */}
            {error && (
                <Card className="p-6 mb-6 border-red-500 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                        ❌ 오류 발생
                    </h3>
                    <p className="text-red-600">{error}</p>
                </Card>
            )}

            {result && result.success && (
                <Card className="p-6 mb-6 border-green-500 bg-green-50">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">
                        ✅ 성공
                    </h3>

                    {result.data && result.data.success !== undefined && (
                        <div className="space-y-2">
                            <p>
                                <strong>상태:</strong>{' '}
                                {result.data.success ? '정상' : '실패'}
                            </p>
                            <p>
                                <strong>응답 시간:</strong>{' '}
                                {result.data.latencyMs
                                    ? `${result.data.latencyMs}ms`
                                    : 'N/A'}
                            </p>
                            <p>
                                <strong>타임스탬프:</strong>{' '}
                                {result.data.timestamp
                                    ? new Date(
                                          result.data.timestamp
                                      ).toLocaleString('ko-KR')
                                    : 'N/A'}
                            </p>
                        </div>
                    )}

                    {result.data && result.data.text && (
                        <div className="space-y-2">
                            <p>
                                <strong>모델:</strong>{' '}
                                {result.data.model || 'N/A'}
                            </p>
                            <p>
                                <strong>입력 토큰:</strong>{' '}
                                {result.data.inputTokens || 'N/A'}
                            </p>
                            <p>
                                <strong>출력 토큰:</strong>{' '}
                                {result.data.outputTokens || 'N/A'}
                            </p>
                            <p>
                                <strong>총 토큰:</strong>{' '}
                                {result.data.totalTokens || 'N/A'}
                            </p>
                            <div className="mt-4 p-4 bg-white rounded border">
                                <strong>생성된 텍스트:</strong>
                                <p className="mt-2 whitespace-pre-wrap">
                                    {result.data.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {result.data &&
                        result.data.estimatedTokens !== undefined && (
                            <div className="space-y-2">
                                <p>
                                    <strong>예상 토큰 수:</strong>{' '}
                                    {result.data.estimatedTokens}
                                </p>
                                <p>
                                    <strong>최대 토큰 제한:</strong>{' '}
                                    {result.data.maxTokens || 'N/A'}
                                </p>
                                <p>
                                    <strong>제한 내 여부:</strong>{' '}
                                    {result.data.isWithinLimit ? (
                                        <span className="text-green-600">
                                            ✓ 제한 내
                                        </span>
                                    ) : (
                                        <span className="text-red-600">
                                            ✗ 제한 초과
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                </Card>
            )}

            {/* 사용 가이드 */}
            <Card className="p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    📖 사용 가이드
                </h3>
                <ul className="space-y-2 text-sm text-blue-900">
                    <li>
                        <strong>헬스체크:</strong> Gemini API 연결 상태를
                        확인합니다
                    </li>
                    <li>
                        <strong>텍스트 생성:</strong> 입력한 프롬프트를 기반으로
                        AI가 텍스트를 생성합니다
                    </li>
                    <li>
                        <strong>토큰 수 계산:</strong> 입력 텍스트의 예상 토큰
                        수를 계산합니다
                    </li>
                    <li className="mt-4 text-xs text-blue-700">
                        💡 이 페이지는 개발 환경에서만 사용하세요
                    </li>
                </ul>
            </Card>
        </div>
    )
}
