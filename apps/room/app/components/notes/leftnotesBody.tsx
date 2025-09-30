'use client'

import React, { useEffect, useCallback } from 'react'
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

const NotesEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: '<p>Start writing your notes here...</p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full h-full p-4 bg-white rounded',
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
    (event: React.DragEvent<HTMLDivElement>) => {
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
    (event: React.ClipboardEvent<HTMLDivElement>) => {
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

  if (!editor) return null

  return (
    <div
      className="h-full w-full flex flex-col bg-gray-50 rounded-lg shadow-lg overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-100 border-b border-gray-300">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('bold') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('italic') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('underline') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('strike') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('bulletList') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded font-semibold transition ${
            editor.isActive('orderedList') ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          1. List
        </button>
        <button
          onClick={addImage}
          className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          Image
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="flex-1 p-4 overflow-y-auto bg-white" />
      <p className="text-gray-500 text-sm p-2">Tip: Drag & drop, copy-paste, or add images via URL!</p>
    </div>
  )
}

export default NotesEditor
