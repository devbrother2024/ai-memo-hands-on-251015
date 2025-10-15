// /components/notes/markdown-shortcuts.tsx
// 마크다운 편집을 위한 키보드 단축키 및 자동 완성 기능
// 타이핑 시 자동으로 마크다운 문법 완성
// 관련 파일: advanced-markdown-editor.tsx, markdown-toolbar.tsx

'use client'

import { useEffect, useRef } from 'react'

interface MarkdownShortcutsProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>
    onInsert: (text: string, cursorOffset?: number) => void
}

export function useMarkdownShortcuts({
    textareaRef,
    onInsert
}: MarkdownShortcutsProps) {
    const lastInputTime = useRef<number>(0)
    const inputTimeout = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // 자동 완성 기능
            if (e.key === ' ') {
                const textarea = textareaRef.current
                if (!textarea) return

                const cursorPos = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPos)
                const lines = textBeforeCursor.split('\n')
                const currentLine = lines[lines.length - 1]

                // 숫자 리스트 자동 완성
                if (/^\d+\.$/.test(currentLine.trim())) {
                    e.preventDefault()
                    const number = parseInt(currentLine.trim().replace('.', ''))
                    onInsert(` ${number + 1}. `, 0)
                    return
                }

                // 체크리스트 자동 완성
                if (currentLine.trim() === '- [ ]') {
                    e.preventDefault()
                    onInsert(' - [ ] ', 0)
                    return
                }
            }

            // 탭 키로 들여쓰기
            if (e.key === 'Tab') {
                e.preventDefault()
                const textarea = textareaRef.current
                if (!textarea) return

                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const value = textarea.value
                const before = value.substring(0, start)
                const after = value.substring(end)

                if (e.shiftKey) {
                    // Shift+Tab: 들여쓰기 제거
                    const lines = before.split('\n')
                    const currentLine = lines[lines.length - 1]
                    if (currentLine.startsWith('  ')) {
                        const newValue = before.slice(0, -2) + after
                        onInsert(newValue, 0)
                        setTimeout(() => {
                            textarea.setSelectionRange(start - 2, end - 2)
                        }, 0)
                    }
                } else {
                    // Tab: 들여쓰기 추가
                    const newValue = before + '  ' + after
                    onInsert(newValue, 0)
                    setTimeout(() => {
                        textarea.setSelectionRange(start + 2, end + 2)
                    }, 0)
                }
            }

            // Enter 키로 자동 완성
            if (e.key === 'Enter') {
                const textarea = textareaRef.current
                if (!textarea) return

                const cursorPos = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPos)
                const lines = textBeforeCursor.split('\n')
                const currentLine = lines[lines.length - 1]

                // 리스트 자동 계속
                if (/^[\s]*[-*+]\s/.test(currentLine)) {
                    e.preventDefault()
                    const indent = currentLine.match(/^[\s]*/)?.[0] || ''
                    onInsert(`\n${indent}- `, 0)
                    return
                }

                // 숫자 리스트 자동 계속
                if (/^[\s]*\d+\.\s/.test(currentLine)) {
                    e.preventDefault()
                    const indent = currentLine.match(/^[\s]*/)?.[0] || ''
                    const number = parseInt(
                        currentLine.match(/\d+/)?.[0] || '1'
                    )
                    onInsert(`\n${indent}${number + 1}. `, 0)
                    return
                }

                // 체크리스트 자동 계속
                if (/^[\s]*-\s\[[\sx]\]\s/.test(currentLine)) {
                    e.preventDefault()
                    const indent = currentLine.match(/^[\s]*/)?.[0] || ''
                    onInsert(`\n${indent}- [ ] `, 0)
                    return
                }

                // 인용문 자동 계속
                if (/^[\s]*>\s/.test(currentLine)) {
                    e.preventDefault()
                    const indent = currentLine.match(/^[\s]*/)?.[0] || ''
                    onInsert(`\n${indent}> `, 0)
                    return
                }
            }

            // 백틱 3개로 코드 블록 자동 완성
            if (e.key === '`') {
                const textarea = textareaRef.current
                if (!textarea) return

                const cursorPos = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPos)
                const textAfterCursor = textarea.value.substring(cursorPos)

                // 연속된 백틱 3개 감지
                if (
                    textBeforeCursor.endsWith('``') &&
                    textAfterCursor.startsWith('`')
                ) {
                    e.preventDefault()
                    const before = textBeforeCursor.slice(0, -2)
                    const after = textAfterCursor.slice(1)
                    onInsert(before + '```\n\n```' + after, 0)
                    setTimeout(() => {
                        textarea.setSelectionRange(cursorPos - 1, cursorPos - 1)
                    }, 0)
                }
            }
        }

        const handleInput = (e: Event) => {
            const target = e.target as HTMLTextAreaElement
            if (!target) return

            lastInputTime.current = Date.now()

            // 입력 후 짧은 지연으로 자동 완성 체크
            if (inputTimeout.current) {
                clearTimeout(inputTimeout.current)
            }

            inputTimeout.current = setTimeout(() => {
                const cursorPos = target.selectionStart
                const textBeforeCursor = target.value.substring(0, cursorPos)
                const lines = textBeforeCursor.split('\n')
                const currentLine = lines[lines.length - 1]

                // 자동 링크 감지 (http/https로 시작하는 URL)
                const urlRegex = /(https?:\/\/[^\s]+)$/
                const urlMatch = currentLine.match(urlRegex)
                if (urlMatch) {
                    const url = urlMatch[1]
                    const beforeUrl = currentLine.replace(urlRegex, '')
                    const newLine = beforeUrl + `[${url}](${url})`
                    const newValue =
                        textBeforeCursor.replace(currentLine, newLine) +
                        target.value.substring(cursorPos)
                    onInsert(newValue, 0)
                }
            }, 1000) // 1초 후 자동 완성
        }

        textarea.addEventListener('keydown', handleKeyDown)
        textarea.addEventListener('input', handleInput)

        return () => {
            textarea.removeEventListener('keydown', handleKeyDown)
            textarea.removeEventListener('input', handleInput)
            if (inputTimeout.current) {
                clearTimeout(inputTimeout.current)
            }
        }
    }, [textareaRef, onInsert])
}
