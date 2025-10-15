'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { AutoResizeTextarea } from './auto-resize-textarea'
import { SaveStatus } from './save-status'
import { BackButton } from '@/components/ui/back-button'
import { DeleteNoteButton } from './delete-note-button'
import { useAutoSave } from '@/lib/notes/hooks'
import { cn } from '@/lib/utils'
import type { Note } from '@/lib/db/schema/notes'
import { SummarySection } from '@/components/notes/summary-section'
import { TagsSection } from '@/components/notes/tags-section'
import { MarkdownRenderer } from './markdown-renderer'
import { AdvancedMarkdownEditor } from './advanced-markdown-editor'
import { Button } from '@/components/ui/button'

interface NoteEditorProps {
    note: Note
    className?: string
}

export function NoteEditor({ note, className }: NoteEditorProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isMac, setIsMac] = useState(false)
    const [isMarkdownMode, setIsMarkdownMode] = useState(false)

    useEffect(() => {
        // 클라이언트에서만 실행
        if (typeof window !== 'undefined' && navigator) {
            setIsMac(navigator.platform.toLowerCase().includes('mac'))
        }
    }, [])

    // 키보드 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isModifierPressed = isMac ? e.metaKey : e.ctrlKey

            if (isModifierPressed && e.key === 'e') {
                e.preventDefault()
                toggleMarkdownMode()
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isMac, isMarkdownMode])

    const {
        title,
        content,
        saveStatus,
        lastSavedAt,
        hasChanges,
        handleTitleChange,
        handleContentChange,
        saveImmediately
    } = useAutoSave({
        noteId: note.id,
        initialTitle: note.title,
        initialContent: note.content || ''
    })

    const handleTitleClick = () => {
        setIsEditingTitle(true)
    }

    const handleTitleBlur = () => {
        setIsEditingTitle(false)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false)
        } else if (e.key === 'Escape') {
            setIsEditingTitle(false)
        }
    }

    const toggleMarkdownMode = () => {
        setIsMarkdownMode(!isMarkdownMode)
    }

    return (
        <div
            className={cn(
                'min-h-screen bg-gray-50 dark:bg-gray-900',
                className
            )}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 영역 */}
                <div className="flex items-center justify-between mb-6">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <Button
                            variant={isMarkdownMode ? 'default' : 'outline'}
                            size="sm"
                            onClick={toggleMarkdownMode}
                            className="text-sm"
                        >
                            {isMarkdownMode ? '편집 모드' : '마크다운 보기'}
                        </Button>
                        <DeleteNoteButton
                            noteId={note.id}
                            noteTitle={note.title}
                            variant="outline"
                            size="sm"
                            redirectAfterDelete={true}
                        />
                        <SaveStatus
                            status={saveStatus}
                            lastSavedAt={lastSavedAt}
                            onRetry={saveImmediately}
                        />
                    </div>
                </div>

                {/* 편집 영역 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
                    {/* 제목 영역 */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        {isEditingTitle ? (
                            <Input
                                value={title}
                                onChange={e =>
                                    handleTitleChange(e.target.value)
                                }
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                className="text-2xl font-bold border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="제목을 입력하세요"
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={handleTitleClick}
                                className="text-2xl font-bold cursor-text p-2 -m-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setIsEditingTitle(true)
                                    }
                                }}
                            >
                                {title || '제목을 클릭하여 편집하세요'}
                            </h1>
                        )}
                    </div>

                    {/* 내용 영역 */}
                    <div className="flex-1 flex flex-col">
                        {isMarkdownMode ? (
                            <MarkdownRenderer
                                content={content || '내용이 없습니다.'}
                                className="flex-1 p-6 min-h-[400px]"
                            />
                        ) : (
                            <AdvancedMarkdownEditor
                                value={content}
                                onChange={handleContentChange}
                                placeholder="마크다운으로 내용을 입력하세요..."
                                className="flex-1"
                            />
                        )}
                    </div>
                </div>

                {/* 요약 섹션 */}
                <SummarySection noteId={note.id} noteContent={content} />

                {/* 태그 섹션 */}
                <div className="mt-6">
                    <TagsSection 
                        noteId={note.id} 
                        content={content}
                        onTagClick={(tagName) => {
                            // 태그 클릭 시 해당 태그로 필터링된 노트 목록으로 이동
                            window.location.href = `/notes?tag=${encodeURIComponent(tagName)}`
                        }}
                    />
                </div>

                {/* 키보드 단축키 안내 */}
                <div className="mt-6 text-sm text-muted-foreground text-center">
                    {isMarkdownMode ? (
                        <div className="space-y-1">
                            <div>마크다운 미리보기 모드입니다</div>
                            <div className="text-xs">
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    {isMac ? 'Cmd' : 'Ctrl'}
                                </kbd>
                                {' + '}
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    S
                                </kbd>
                                {' 로 즉시 저장 • '}
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    E
                                </kbd>
                                {' 로 편집 모드로 전환'}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div>
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    {isMac ? 'Cmd' : 'Ctrl'}
                                </kbd>
                                {' + '}
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    S
                                </kbd>
                                {
                                    ' 로 즉시 저장 • 변경사항은 3초 후 자동 저장됩니다'
                                }
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    Tab
                                </kbd>
                                {' 들여쓰기 • '}
                                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    Enter
                                </kbd>
                                {' 리스트 자동 계속 • '}
                                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                    ```
                                </kbd>
                                {' 코드 블록'}
                            </div>
                        </div>
                    )}
                </div>

                {/* 변경사항 표시 */}
                {hasChanges && saveStatus === 'idle' && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            저장되지 않은 변경사항이 있습니다
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
