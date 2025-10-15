// components/notes/summary-section.tsx
// 노트 상세 화면에서 요약을 표시하고 생성/재생성할 수 있는 UI 컴포넌트
// 관련 파일: app/api/notes/[id]/summary/route.ts, lib/notes/queries.ts

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import type { Summary } from '@/lib/db/schema/summaries'

interface SummarySectionProps {
    noteId: string
    noteContent?: string
}

export function SummarySection({
    noteId,
    noteContent = ''
}: SummarySectionProps) {
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 노트 내용이 100자 이상인지 확인
    const canGenerateSummary = noteContent.trim().length >= 100

    useEffect(() => {
        fetchSummary()
    }, [noteId])

    const fetchSummary = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/notes/${noteId}/summary`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch summary')
            }
            const data = await response.json()
            setSummary(data.summary)
        } catch (err: any) {
            setError(err.message)
            setSummary(null)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async (regenerate: boolean) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/notes/${noteId}/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ regenerate })
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate summary')
            }
            const data = await response.json()
            setSummary(data.summary)
        } catch (err: any) {
            setError(err.message)
            setSummary(null)
        } finally {
            setLoading(false)
        }
    }

    // 노트 내용이 100자 미만이면 요약 섹션을 표시하지 않음
    if (!canGenerateSummary) {
        return null
    }

    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" /> AI 요약
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate(false)}
                        disabled={loading}
                    >
                        {loading
                            ? '생성 중...'
                            : summary
                            ? '다시 불러오기'
                            : '요약 생성'}
                    </Button>
                    {summary && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerate(true)}
                            disabled={loading}
                        >
                            {loading ? '재생성 중...' : '재생성'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="text-sm text-red-600 mb-2">{error}</div>
                )}
                {summary ? (
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {summary.content}
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        요약 생성 중...
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        노트 내용을 기반으로 AI 요약을 생성할 수 있습니다.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
