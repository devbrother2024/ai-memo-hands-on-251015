// /components/notes/advanced-markdown-editor.tsx
// 고급 마크다운 편집기 컴포넌트
// 툴바, 실시간 미리보기, 분할 화면 기능 제공
// 관련 파일: markdown-toolbar.tsx, markdown-renderer.tsx, note-editor.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { AutoResizeTextarea } from './auto-resize-textarea'
import { MarkdownToolbar } from './markdown-toolbar'
import { MarkdownRenderer } from './markdown-renderer'
import { useMarkdownShortcuts } from './markdown-shortcuts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Split, Maximize2, Minimize2 } from 'lucide-react'

interface AdvancedMarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

type ViewMode = 'edit' | 'preview' | 'split'

export function AdvancedMarkdownEditor({
    value,
    onChange,
    placeholder = '마크다운으로 작성하세요...',
    className
}: AdvancedMarkdownEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('split')
    const [cursorPosition, setCursorPosition] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // 커서 위치 업데이트
    const handleTextareaChange = (newValue: string) => {
        onChange(newValue)
        if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart)
        }
    }

    // 툴바에서 텍스트 삽입
    const handleInsertText = (text: string, cursorOffset: number = 0) => {
        if (!textareaRef.current) return

        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = value.substring(0, start)
        const after = value.substring(end)
        const newValue = before + text + after

        onChange(newValue)

        // 커서 위치 설정
        setTimeout(() => {
            const newCursorPos = start + text.length - cursorOffset
            textarea.focus()
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            setCursorPosition(newCursorPos)
        }, 0)
    }

    // 마크다운 단축키 기능
    useMarkdownShortcuts({
        textareaRef,
        onInsert: handleInsertText
    })

    // 키보드 단축키
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault()
                        setViewMode('edit')
                        break
                    case '2':
                        e.preventDefault()
                        setViewMode('preview')
                        break
                    case '3':
                        e.preventDefault()
                        setViewMode('split')
                        break
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* 툴바 */}
            <MarkdownToolbar onInsert={handleInsertText} />

            {/* 뷰 모드 컨트롤 */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1">
                    <Button
                        variant={viewMode === 'edit' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('edit')}
                        className="text-xs"
                    >
                        <Maximize2 className="h-3 w-3 mr-1" />
                        편집
                        <kbd className="ml-1 px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            Ctrl+1
                        </kbd>
                    </Button>
                    <Button
                        variant={viewMode === 'preview' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('preview')}
                        className="text-xs"
                    >
                        <Eye className="h-3 w-3 mr-1" />
                        미리보기
                        <kbd className="ml-1 px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            Ctrl+2
                        </kbd>
                    </Button>
                    <Button
                        variant={viewMode === 'split' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('split')}
                        className="text-xs"
                    >
                        <Split className="h-3 w-3 mr-1" />
                        분할
                        <kbd className="ml-1 px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            Ctrl+3
                        </kbd>
                    </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {value.length}자 • {value.split('\n').length}줄
                </div>
            </div>

            {/* 편집 영역 */}
            <div className="flex-1 flex">
                {/* 편집기 */}
                {(viewMode === 'edit' || viewMode === 'split') && (
                    <div
                        className={cn(
                            'flex-1 flex flex-col',
                            viewMode === 'split'
                                ? 'w-1/2 border-r border-gray-200 dark:border-gray-700'
                                : 'w-full'
                        )}
                    >
                        <div className="flex-1 p-4">
                            <AutoResizeTextarea
                                ref={textareaRef}
                                value={value}
                                onChange={handleTextareaChange}
                                placeholder={placeholder}
                                className="w-full h-full border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-mono leading-relaxed resize-none"
                                minRows={20}
                                maxRows={50}
                            />
                        </div>
                    </div>
                )}

                {/* 미리보기 */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                    <div
                        className={cn(
                            'flex-1 flex flex-col',
                            viewMode === 'split' ? 'w-1/2' : 'w-full'
                        )}
                    >
                        <div className="flex-1 p-4 overflow-y-auto">
                            {value.trim() ? (
                                <MarkdownRenderer content={value} />
                            ) : (
                                <div className="text-gray-400 dark:text-gray-500 text-center py-8">
                                    미리보기를 위해 마크다운을 입력하세요
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 상태바 */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span>커서: {cursorPosition}</span>
                        <span>
                            선택:{' '}
                            {textareaRef.current?.selectionEnd &&
                            textareaRef.current?.selectionStart
                                ? textareaRef.current.selectionEnd -
                                  textareaRef.current.selectionStart
                                : 0}
                            자
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>마크다운 지원</span>
                        <div className="flex gap-1">
                            <div
                                className="w-2 h-2 bg-green-500 rounded-full"
                                title="제목, 문단"
                            />
                            <div
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                title="링크, 이미지"
                            />
                            <div
                                className="w-2 h-2 bg-purple-500 rounded-full"
                                title="코드, 리스트"
                            />
                            <div
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                title="테이블, 인용문"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
