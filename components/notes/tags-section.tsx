// components/notes/tags-section.tsx
// 노트 태그 표시 및 관리 컴포넌트
// 태그 생성, 표시, 재생성, 필터링 기능을 제공한다
// 관련 파일: lib/ai/actions.ts, lib/notes/tag-queries.ts, components/notes/note-editor.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { generateTagsForNote, regenerateTagsForNote } from '@/lib/ai/actions'
import { getTagsByNoteId } from '@/lib/notes/tag-queries'
import { Tag } from '@/lib/db/schema/tags'
import { Sparkles, RefreshCw, Tag as TagIcon } from 'lucide-react'

interface TagsSectionProps {
    noteId: string
    content: string
    onTagClick?: (tagName: string) => void
}

export function TagsSection({ noteId, content, onTagClick }: TagsSectionProps) {
    const [tags, setTags] = useState<Tag[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 태그 로드
    const loadTags = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const fetchedTags = await getTagsByNoteId(noteId)
            setTags(fetchedTags)
        } catch (err) {
            console.error('태그 로드 오류:', err)
            setError('태그를 불러올 수 없습니다')
        } finally {
            setIsLoading(false)
        }
    }

    // 태그 생성
    const handleGenerateTags = async () => {
        if (content.length < 100) {
            setError('노트 내용이 100자 이상이어야 합니다')
            return
        }

        try {
            setIsGenerating(true)
            setError(null)
            
            const result = await generateTagsForNote(noteId, content)
            
            if (result.success) {
                // 태그 다시 로드
                await loadTags()
            } else {
                setError(result.error || '태그 생성에 실패했습니다')
            }
        } catch (err) {
            console.error('태그 생성 오류:', err)
            setError('태그 생성 중 오류가 발생했습니다')
        } finally {
            setIsGenerating(false)
        }
    }

    // 태그 재생성
    const handleRegenerateTags = async () => {
        if (content.length < 100) {
            setError('노트 내용이 100자 이상이어야 합니다')
            return
        }

        try {
            setIsGenerating(true)
            setError(null)
            
            const result = await regenerateTagsForNote(noteId, content)
            
            if (result.success) {
                // 태그 다시 로드
                await loadTags()
            } else {
                setError(result.error || '태그 재생성에 실패했습니다')
            }
        } catch (err) {
            console.error('태그 재생성 오류:', err)
            setError('태그 재생성 중 오류가 발생했습니다')
        } finally {
            setIsGenerating(false)
        }
    }

    // 태그 클릭 처리
    const handleTagClick = (tagName: string) => {
        if (onTagClick) {
            onTagClick(tagName)
        }
    }

    // 컴포넌트 마운트 시 태그 로드
    useEffect(() => {
        loadTags()
    }, [noteId])

    // 태그가 없고 내용이 충분한 경우에만 생성 버튼 표시
    const shouldShowGenerateButton = tags.length === 0 && content.length >= 100

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">태그</h3>
                </div>
                
                {tags.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateTags}
                        disabled={isGenerating || content.length < 100}
                        className="h-8"
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                        재생성
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex gap-2 flex-wrap">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-16 rounded-full" />
                    ))}
                </div>
            ) : tags.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => handleTagClick(tag.name)}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 cursor-pointer"
                            style={{ 
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                border: `1px solid ${tag.color}40`
                            }}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            ) : shouldShowGenerateButton ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTags}
                    disabled={isGenerating}
                    className="h-8"
                >
                    <Sparkles className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-pulse' : ''}`} />
                    {isGenerating ? '태그 생성 중...' : '태그 생성'}
                </Button>
            ) : content.length < 100 ? (
                <p className="text-sm text-muted-foreground">
                    노트 내용이 100자 이상일 때 태그를 생성할 수 있습니다
                </p>
            ) : null}

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    {error}
                </div>
            )}
        </div>
    )
}
