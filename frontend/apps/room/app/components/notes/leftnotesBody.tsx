'use client'
import React, { useEffect, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Image from '@tiptap/extension-image'
import Blockquote from '@tiptap/extension-blockquote'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

const NotesEditor = () => {
  const [title, setTitle] = useState('Untitled')
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Blockquote,
      Code,
      CodeBlock,
      HorizontalRule,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your notes here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  const addImage = useCallback(() => {
    const url = prompt('Enter image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            editor?.chain().focus().setImage({ src: reader.result }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [editor]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item?.type.indexOf('image') !== -1) {
          const file = item?.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              if (reader.result && typeof reader.result === 'string') {
                editor?.chain().focus().setImage({ src: reader.result }).run()
              }
            }
            reader.readAsDataURL(file)
          }
        }
      }
    },
    [editor]
  )

  const downloadAsHTML = () => {
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1, h2, h3 { font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; }
        blockquote {
            border-left: 3px solid #ddd;
            padding-left: 1em;
            color: #666;
            margin: 1em 0;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
        }
        ul, ol { padding-left: 2em; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${editor?.getHTML() || ''}
</body>
</html>
    `
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.html`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const downloadAsMarkdown = () => {
    const turndownService = new (window as any).TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    })
    const markdown = `# ${title}\n\n${turndownService.turndown(editor?.getHTML() || '')}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const downloadAsText = () => {
    const text = `${title}\n\n${editor?.getText() || ''}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  if (!editor) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
            placeholder="Untitled"
          />
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={downloadAsHTML}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                >
                  Download as HTML
                </button>
                <button
                  onClick={downloadAsMarkdown}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                >
                  Download as Markdown
                </button>
                <button
                  onClick={downloadAsText}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm"
                >
                  Download as Text
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="border-b border-gray-200 p-3">
            <div className="flex flex-wrap gap-1">
              {/* Text Formatting */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 mr-1">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('bold') ? 'bg-gray-200' : ''
                  }`}
                  title="Bold"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4v12h4.5c1.9 0 3.5-1.6 3.5-3.5 0-1.3-.7-2.4-1.8-3 .6-.5 1-1.3 1-2.2C13.2 5.6 11.9 4 10.2 4H6zm2 2h2.2c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3H8V6zm0 6v-2.5h2.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8v-.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('italic') ? 'bg-gray-200' : ''
                  }`}
                  title="Italic"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 4v2h1.5l-3 8H7v2h6v-2h-1.5l3-8H16V4h-6z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('underline') ? 'bg-gray-200' : ''
                  }`}
                  title="Underline"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15c-2.8 0-5-2.2-5-5V4h2v6c0 1.7 1.3 3 3 3s3-1.3 3-3V4h2v6c0 2.8-2.2 5-5 5zM5 17h10v1H5v-1z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('strike') ? 'bg-gray-200' : ''
                  }`}
                  title="Strikethrough"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15c-1.7 0-3-.8-3-2h2c0 .3.4.5 1 .5s1-.2 1-.5-.4-.5-1-.5H9v-2h1c.6 0 1-.2 1-.5s-.4-.5-1-.5-1 .2-1 .5H7c0-1.2 1.3-2 3-2s3 .8 3 2c0 .7-.4 1.3-1 1.6.6.3 1 .9 1 1.6 0 1.2-1.3 2-3 2zM4 10h12v1H4v-1z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('code') ? 'bg-gray-200' : ''
                  }`}
                  title="Inline Code"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.7 13.3l-3-3 3-3 1.4 1.4-1.6 1.6 1.6 1.6-1.4 1.4zm4.6 0l3-3-3-3-1.4 1.4 1.6 1.6-1.6 1.6 1.4 1.4z"/>
                  </svg>
                </button>
              </div>

              {/* Headings */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 mr-1">
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-3 py-2 rounded hover:bg-gray-100 transition text-sm font-semibold ${
                    editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
                  }`}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-2 rounded hover:bg-gray-100 transition text-sm font-semibold ${
                    editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
                  }`}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`px-3 py-2 rounded hover:bg-gray-100 transition text-sm font-semibold ${
                    editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
                  }`}
                  title="Heading 3"
                >
                  H3
                </button>
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 mr-1">
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('bulletList') ? 'bg-gray-200' : ''
                  }`}
                  title="Bullet List"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 6h2v2H4V6zm0 4h2v2H4v-2zm0 4h2v2H4v-2zm4-8h10v2H8V6zm0 4h10v2H8v-2zm0 4h10v2H8v-2z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('orderedList') ? 'bg-gray-200' : ''
                  }`}
                  title="Numbered List"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 7V5H4v2h1zm-1 3v1h1v1H4v1h2v-3H4v1h1v-1H4zm1 5v-1H4v1h1zm1-11h10v2H8V4zm0 4h10v2H8V8zm0 4h10v2H8v-2z"/>
                  </svg>
                </button>
              </div>

              {/* Additional */}
              <div className="flex gap-1">
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('blockquote') ? 'bg-gray-200' : ''
                  }`}
                  title="Blockquote"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 7c0-1.7-1.3-3-3-3v2c.6 0 1 .4 1 1 0 .3-.1.5-.3.7l-.9.9C4.3 9.1 4 9.6 4 10v1h3v-1c0-.2.1-.4.3-.6l.9-.9C8.7 8 9 7.5 9 7zm7 0c0-1.7-1.3-3-3-3v2c.6 0 1 .4 1 1 0 .3-.1.5-.3.7l-.9.9c-.5.5-.8 1-.8 1.6v1h3v-1c0-.2.1-.4.3-.6l.9-.9c.5-.5.8-1 .8-1.7z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    editor.isActive('codeBlock') ? 'bg-gray-200' : ''
                  }`}
                  title="Code Block"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4h14v12H3V4zm2 2v8h10V6H5zm1 2h8v1H6V8zm0 2h6v1H6v-1z"/>
                  </svg>
                </button>
                <button
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="Horizontal Rule"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 10h14v1H3v-1z"/>
                  </svg>
                </button>
                <button
                  onClick={addImage}
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="Add Image"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1zm0 2v8l3-3 2 2 3-3 3 3V5H4zm9 3c0-.6-.4-1-1-1s-1 .4-1 1 .4 1 1 1 1-.4 1-1z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            className="min-h-[600px] p-8"
          >
            <EditorContent editor={editor} />
          </div>

          {/* Footer Tip */}
          <div className="border-t border-gray-200 px-8 py-3 bg-gray-50 text-xs text-gray-500">
            💡 Tip: Drag & drop, copy-paste, or use the toolbar button to add images
          </div>
        </div>
      </div>

      {/* Load Turndown for Markdown conversion */}
      <script src="https://unpkg.com/turndown@7.1.2/dist/turndown.js"></script>
    </div>
  )
}

export default NotesEditor