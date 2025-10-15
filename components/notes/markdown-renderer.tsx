// /components/notes/markdown-renderer.tsx
// 마크다운 텍스트를 React 컴포넌트로 렌더링하는 컴포넌트
// 노트 내용이 마크다운 형식일 때 사용
// 관련 파일: note-editor.tsx, auto-resize-textarea.tsx

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
    content: string
    className?: string
}

export function MarkdownRenderer({
    content,
    className
}: MarkdownRendererProps) {
    return (
        <div className={cn('prose prose-gray max-w-none', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 제목 스타일링
                    h1: ({ children, ...props }) => (
                        <h1
                            className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ children, ...props }) => (
                        <h2
                            className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ children, ...props }) => (
                        <h3
                            className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h3>
                    ),
                    h4: ({ children, ...props }) => (
                        <h4
                            className="text-base font-medium mb-2 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h4>
                    ),
                    h5: ({ children, ...props }) => (
                        <h5
                            className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h5>
                    ),
                    h6: ({ children, ...props }) => (
                        <h6
                            className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </h6>
                    ),

                    // 문단 스타일링
                    p: ({ children, ...props }) => (
                        <p
                            className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                            {...props}
                        >
                            {children}
                        </p>
                    ),

                    // 리스트 스타일링
                    ul: ({ children, ...props }) => (
                        <ul
                            className="mb-4 ml-4 list-disc space-y-1"
                            {...props}
                        >
                            {children}
                        </ul>
                    ),
                    ol: ({ children, ...props }) => (
                        <ol
                            className="mb-4 ml-4 list-decimal space-y-1"
                            {...props}
                        >
                            {children}
                        </ol>
                    ),
                    li: ({ children, ...props }) => {
                        // 체크리스트 아이템 감지
                        const text = children?.toString() || ''
                        const isChecklist =
                            text.includes('[ ]') || text.includes('[x]')
                        const isChecked = text.includes('[x]')

                        if (isChecklist) {
                            return (
                                <li
                                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                                    {...props}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        readOnly
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span
                                        className={
                                            isChecked
                                                ? 'line-through text-gray-500'
                                                : ''
                                        }
                                    >
                                        {text.replace(/\[[ x]\]\s*/, '')}
                                    </span>
                                </li>
                            )
                        }

                        return (
                            <li
                                className="text-gray-700 dark:text-gray-300"
                                {...props}
                            >
                                {children}
                            </li>
                        )
                    },

                    // 인용문 스타일링
                    blockquote: ({ children, ...props }) => (
                        <blockquote
                            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800/50 italic text-gray-600 dark:text-gray-400"
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),

                    // 코드 블록 스타일링
                    code: ({ children, className, ...props }) => {
                        const isInline = !className?.includes('language-')

                        if (isInline) {
                            return (
                                <code
                                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
                                    {...props}
                                >
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <code
                                className={cn(
                                    'block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto',
                                    className
                                )}
                                {...props}
                            >
                                {children}
                            </code>
                        )
                    },

                    pre: ({ children, ...props }) => (
                        <pre className="mb-4 overflow-x-auto" {...props}>
                            {children}
                        </pre>
                    ),

                    // 링크 스타일링
                    a: ({ children, href, ...props }) => (
                        <a
                            href={href}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                        </a>
                    ),

                    // 강조 스타일링
                    strong: ({ children, ...props }) => (
                        <strong
                            className="font-semibold text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </strong>
                    ),
                    em: ({ children, ...props }) => (
                        <em
                            className="italic text-gray-800 dark:text-gray-200"
                            {...props}
                        >
                            {children}
                        </em>
                    ),

                    // 구분선 스타일링
                    hr: ({ ...props }) => (
                        <hr
                            className="my-6 border-gray-300 dark:border-gray-600"
                            {...props}
                        />
                    ),

                    // 테이블 스타일링
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto mb-4">
                            <table
                                className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg"
                                {...props}
                            >
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children, ...props }) => (
                        <thead
                            className="bg-gray-50 dark:bg-gray-800"
                            {...props}
                        >
                            {children}
                        </thead>
                    ),
                    tbody: ({ children, ...props }) => (
                        <tbody
                            className="divide-y divide-gray-200 dark:divide-gray-700"
                            {...props}
                        >
                            {children}
                        </tbody>
                    ),
                    tr: ({ children, ...props }) => (
                        <tr {...props}>{children}</tr>
                    ),
                    th: ({ children, ...props }) => (
                        <th
                            className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100"
                            {...props}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children, ...props }) => (
                        <td
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                            {...props}
                        >
                            {children}
                        </td>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
