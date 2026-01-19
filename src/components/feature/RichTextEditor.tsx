import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/utils'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    className?: string
}

export function RichTextEditor({
    content,
    onChange,
    className,
}: RichTextEditorProps) {
    const [linkUrl, setLinkUrl] = useState('')
    const [showLinkInput, setShowLinkInput] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3, 4],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-barby-gold hover:text-barby-gold/80 underline',
                },
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-invert prose-gold max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    })

    // Update editor content when prop changes (from external data loading)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content)
        }
    }, [editor, content])

    const addLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().setLink({ href: linkUrl }).run()
            setLinkUrl('')
            setShowLinkInput(false)
        }
    }, [editor, linkUrl])

    if (!editor) {
        return null
    }

    return (
        <div className={cn('card-vintage overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-barby-gold/20 bg-barby-dark">
                {/* Text Style */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="מודגש"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="נטוי"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="קו חוצה"
                >
                    <s>S</s>
                </ToolbarButton>

                <div className="w-px h-6 bg-barby-gold/20 mx-1" />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="כותרת 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="כותרת 3"
                >
                    H3
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    active={editor.isActive('heading', { level: 4 })}
                    title="כותרת 4"
                >
                    H4
                </ToolbarButton>

                <div className="w-px h-6 bg-barby-gold/20 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="רשימה"
                >
                    •
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="רשימה ממוספרת"
                >
                    1.
                </ToolbarButton>

                <div className="w-px h-6 bg-barby-gold/20 mx-1" />

                {/* Block */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="ציטוט"
                >
                    "
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="קו הפרדה"
                >
                    —
                </ToolbarButton>

                <div className="w-px h-6 bg-barby-gold/20 mx-1" />

                {/* Link */}
                {showLinkInput ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="px-2 py-1 text-sm bg-barby-black border border-barby-gold/30 text-barby-cream focus:outline-none focus:border-barby-gold"
                            dir="ltr"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addLink()
                                if (e.key === 'Escape') setShowLinkInput(false)
                            }}
                        />
                        <ToolbarButton onClick={addLink} title="הוסף">
                            ✓
                        </ToolbarButton>
                        <ToolbarButton onClick={() => setShowLinkInput(false)} title="ביטול">
                            ✕
                        </ToolbarButton>
                    </div>
                ) : (
                    <ToolbarButton
                        onClick={() => setShowLinkInput(true)}
                        active={editor.isActive('link')}
                        title="קישור"
                    >
                        🔗
                    </ToolbarButton>
                )}
                {editor.isActive('link') && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="הסר קישור"
                    >
                        ❌
                    </ToolbarButton>
                )}

                <div className="flex-1" />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="בטל"
                >
                    ↶
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="חזור"
                >
                    ↷
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    )
}

interface ToolbarButtonProps {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title?: string
    children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2 text-sm transition-colors rounded',
                active ? 'bg-barby-gold text-barby-black' : 'text-barby-cream hover:bg-barby-gold/20',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {children}
        </button>
    )
}
