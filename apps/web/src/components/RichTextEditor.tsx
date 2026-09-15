import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarButtonClass =
  'flex h-7 w-7 items-center justify-center text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:hover:bg-black/[0.05] light:hover:text-neutral-900';
const toolbarButtonActiveClass = 'bg-amber-400/15 text-amber-300 light:bg-amber-400/20 light:text-amber-700';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3';

const BLOCK_OPTIONS: { value: BlockType; label: string }[] = [
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'h1', label: 'Título 1' },
  { value: 'h2', label: 'Título 2' },
  { value: 'h3', label: 'Título 3' },
];

// Schema deliberadamente contido — cobre o que o legado usa (parágrafo,
// título, negrito, lista) sem virar um editor de documento completo (sem
// blockquote/code block/tabela). Toolbar fica em: tipo de bloco, negrito,
// itálico, listas, link.
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: false,
        codeBlock: false,
        code: false,
        strike: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank' },
      }),
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'min-h-[84px] text-sm text-white outline-none ' +
          '[&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:text-amber-400 [&_a]:underline ' +
          '[&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-bold ' +
          '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 ' +
          'light:text-neutral-900',
      },
    },
  });

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('URL do link:', '');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  }

  if (!editor) return null;

  const currentBlockType: BlockType = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'paragraph';

  function setBlockType(value: BlockType) {
    if (!editor) return;
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(value.slice(1)) as 1 | 2 | 3;
    editor.chain().focus().setHeading({ level }).run();
  }

  return (
    <div className="w-full rounded-lg border border-white/10 bg-white/5 transition focus-within:border-amber-400/60 focus-within:bg-white/[0.07] focus-within:ring-2 focus-within:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:focus-within:bg-white">
      <div className="flex items-center gap-0.5 border-b border-white/10 px-1.5 py-1 light:border-black/10">
        <select
          value={currentBlockType}
          onChange={(event) => setBlockType(event.target.value as BlockType)}
          aria-label="Tipo de bloco"
          className="mr-1 rounded-md border-0 bg-transparent px-1.5 py-1 text-xs font-medium text-neutral-300 outline-none transition hover:bg-white/[0.06] light:text-neutral-700 light:hover:bg-black/[0.05]"
        >
          {BLOCK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0d0d14] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <span className="h-4 w-px bg-white/15 light:bg-black/15" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrito"
          aria-pressed={editor.isActive('bold')}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive('bold') ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 4h8a4 4 0 010 8H6z" />
            <path d="M6 12h9a4 4 0 010 8H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Itálico"
          aria-pressed={editor.isActive('italic')}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive('italic') ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 4h-9M14 20H5M15 4 9 20" />
          </svg>
        </button>
        <span className="h-4 w-px bg-white/15 light:bg-black/15" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          aria-label="Alinhar à esquerda"
          aria-pressed={editor.isActive({ textAlign: 'left' })}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive({ textAlign: 'left' }) ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h10M4 18h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          aria-label="Centralizar"
          aria-pressed={editor.isActive({ textAlign: 'center' })}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive({ textAlign: 'center' }) ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M8 12h8M6 18h12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          aria-label="Alinhar à direita"
          aria-pressed={editor.isActive({ textAlign: 'right' })}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive({ textAlign: 'right' }) ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M10 12h10M6 18h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          aria-label="Justificar"
          aria-pressed={editor.isActive({ textAlign: 'justify' })}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive({ textAlign: 'justify' }) ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="h-4 w-px bg-white/15 light:bg-black/15" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista com marcadores"
          aria-pressed={editor.isActive('bulletList')}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive('bulletList') ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
            <path d="M9 6h11M9 12h11M9 18h11" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada"
          aria-pressed={editor.isActive('orderedList')}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive('orderedList') ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="M4 6h1M4 6v3M4 10h1.5M4.5 12v3M4 14.5h1.5M4 18h1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="h-4 w-px bg-white/15 light:bg-black/15" />
        <button
          type="button"
          onClick={toggleLink}
          aria-label="Link"
          aria-pressed={editor.isActive('link')}
          className={`${toolbarButtonClass} rounded-md ${editor.isActive('link') ? toolbarButtonActiveClass : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.5-1.5" />
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} className="max-h-[420px] overflow-y-auto px-3.5 py-2.5" />
    </div>
  );
}
