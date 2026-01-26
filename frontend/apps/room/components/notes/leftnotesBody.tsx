'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { ImagePlus, Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const NotesEditor = () => {
  const [title, setTitle] = useState('Untitled Note')
  const contentRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-sm rounded-lg shadow-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'focus:outline-none prose prose-lg max-w-none min-h-[calc(100vh-280px)] text-gray-800',
      },
    },
    immediatelyRender: false,
  })

  /* ---------------- IMAGE HELPERS ---------------- */

  const insertImages = useCallback(
    (sources: string[]) => {
      sources.forEach((src) => {
        editor?.chain().focus().setImage({ src }).run()
      })
    },
    [editor]
  )

  const addImage = useCallback(() => {
    const input = prompt(
      'Enter image URL(s), separated by commas or new lines:'
    )
    if (!input) return

    const urls = input
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter(Boolean)

    insertImages(urls)
  }, [insertImages])

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return

        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            insertImages([reader.result])
          }
        }
        reader.readAsDataURL(file)
      })

      event.target.value = ''
    },
    [insertImages]
  )

  /* ---------------- PDF DOWNLOAD ---------------- */

  const downloadAsPDF = () => {
    if (!contentRef.current) return

    const element = contentRef.current

    html2pdf()
      .set({
        margin: 10,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
  }

  if (!editor) return null

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ProseMirror img {
          max-width: 400px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between gap-6 mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-bold focus:outline-none flex-1 text-black"
              placeholder="Untitled Note"
            />
            <button
              onClick={downloadAsPDF}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm ${
                editor.isActive('bold')
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              B
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-5 py-2.5 rounded-lg italic text-sm ${
                editor.isActive('italic')
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              I
            </button>

            <div className="w-px bg-gray-300 mx-1" />

            <label className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 cursor-pointer flex items-center gap-2 text-sm">
              <ImagePlus size={16} />
              Upload
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={addImage}
              className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm"
            >
              Image URL
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content (PDF Source) */}
      <div className="flex-1 overflow-y-auto">
        <div ref={contentRef} className="w-full px-8 py-8 bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default NotesEditor
