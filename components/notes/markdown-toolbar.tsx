// /components/notes/markdown-toolbar.tsx
// 마크다운 편집을 위한 툴바 컴포넌트
// 텍스트 포맷팅, 링크, 이미지, 코드 블록 등의 기능 제공
// 관련 파일: note-editor.tsx, markdown-renderer.tsx

'use client'

import { Button } from '@/components/ui/button'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Link,
    Image,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Minus,
    Type,
    CheckSquare,
    Table,
    AlignLeft
} from 'lucide-react'

interface MarkdownToolbarProps {
    onInsert: (text: string, cursorOffset?: number) => void
    className?: string
}

export function MarkdownToolbar({ onInsert, className }: MarkdownToolbarProps) {
    const insertText = (
        before: string,
        after: string = '',
        cursorOffset: number = 0
    ) => {
        onInsert(before + after, cursorOffset)
    }

    const insertHeading = (level: number) => {
        const hashes = '#'.repeat(level)
        insertText(`${hashes} `, '', 1)
    }

    const insertLink = () => {
        insertText('[링크 텍스트](', 'https://example.com)', 1)
    }

    const insertImage = () => {
        insertText('![이미지 설명](', 'https://example.com/image.jpg)', 1)
    }

    const insertCodeBlock = () => {
        insertText('```\n', '\n```', 1)
    }

    const insertQuote = () => {
        insertText('> ', '인용문을 입력하세요', 1)
    }

    const insertHorizontalRule = () => {
        insertText('\n---\n')
    }

    const insertChecklist = () => {
        insertText('- [ ] ', '체크리스트 항목', 1)
    }

    const insertTable = () => {
        const tableText = `
| 열 1 | 열 2 | 열 3 |
|------|------|------|
| 데이터 1 | 데이터 2 | 데이터 3 |
| 데이터 4 | 데이터 5 | 데이터 6 |
`
        insertText(tableText, '', 0)
    }

    const insertAlignment = () => {
        insertText('::: center\n', '\n:::', 1)
    }

    return (
        <div
            className={`flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
        >
            {/* 제목 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(1)}
                    title="제목 1"
                    className="h-8 w-8 p-0"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(2)}
                    title="제목 2"
                    className="h-8 w-8 p-0"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(3)}
                    title="제목 3"
                    className="h-8 w-8 p-0"
                >
                    <Heading3 className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* 텍스트 포맷팅 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('**', '**', 2)}
                    title="굵게"
                    className="h-8 w-8 p-0"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('*', '*', 1)}
                    title="기울임"
                    className="h-8 w-8 p-0"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('~~', '~~', 2)}
                    title="취소선"
                    className="h-8 w-8 p-0"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('`', '`', 1)}
                    title="인라인 코드"
                    className="h-8 w-8 p-0"
                >
                    <Code className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* 링크 및 이미지 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertLink}
                    title="링크 삽입"
                    className="h-8 w-8 p-0"
                >
                    <Link className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertImage}
                    title="이미지 삽입"
                    className="h-8 w-8 p-0"
                >
                    <Image className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* 리스트 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('- ', '리스트 항목', 1)}
                    title="순서 없는 리스트"
                    className="h-8 w-8 p-0"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('1. ', '리스트 항목', 1)}
                    title="순서 있는 리스트"
                    className="h-8 w-8 p-0"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* 체크리스트 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertChecklist}
                    title="체크리스트"
                    className="h-8 w-8 p-0"
                >
                    <CheckSquare className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* 기타 */}
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertQuote}
                    title="인용문"
                    className="h-8 w-8 p-0"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertCodeBlock}
                    title="코드 블록"
                    className="h-8 w-8 p-0"
                >
                    <Type className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertTable}
                    title="테이블"
                    className="h-8 w-8 p-0"
                >
                    <Table className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertAlignment}
                    title="정렬"
                    className="h-8 w-8 p-0"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertHorizontalRule}
                    title="구분선"
                    className="h-8 w-8 p-0"
                >
                    <Minus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
