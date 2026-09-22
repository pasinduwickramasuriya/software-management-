import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Table as TableIcon, Code, Maximize2, Minimize2,
  ChevronDown, RowsIcon, Columns, Trash2,
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder || 'Enter project requirements and description here...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { style: 'min-height:150px; padding:16px; outline:none; font-size:0.95rem; line-height:1.5; color:#0f172a;' },
    },
  });

  useEffect(() => {
  if (isFullscreen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => { document.body.style.overflow = ''; };
}, [isFullscreen]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(false);
  }, [editor]);

  if (!editor) return null;

  const insideTable = editor.isActive('table');

  const blockLabel = editor.isActive('heading', { level: 1 }) ? 'Heading 1'
    : editor.isActive('heading', { level: 2 }) ? 'Heading 2'
    : editor.isActive('heading', { level: 3 }) ? 'Heading 3'
    : 'Paragraph';

  return (
    <div style={isFullscreen ? fullscreenWrapStyle : editorWrapStyle}>

      {/* Main toolbar */}
      <div style={toolbarStyle}>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setShowBlockMenu(v => !v)} style={blockDropdownBtnStyle}>
            {blockLabel} <ChevronDown size={14} />
          </button>
          {showBlockMenu && (
            <div style={dropdownMenuStyle}>
              <DropdownItem onClick={() => { editor.chain().focus().setParagraph().run(); setShowBlockMenu(false); }}>Paragraph</DropdownItem>
              <DropdownItem bold onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowBlockMenu(false); }}>Heading 1</DropdownItem>
              <DropdownItem bold onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowBlockMenu(false); }}>Heading 2</DropdownItem>
              <DropdownItem bold onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowBlockMenu(false); }}>Heading 3</DropdownItem>
            </div>
          )}
        </div>

        <Divider />

        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={16} /></ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive('link')} onClick={setLink}><LinkIcon size={16} /></ToolBtn>

        <div style={{ position: 'relative' }}>
          <ToolBtn active={insideTable} onClick={() => setShowTableMenu(v => !v)}><TableIcon size={16} /></ToolBtn>
          {showTableMenu && !insideTable && (
            <div style={dropdownMenuStyle}>
              <DropdownItem onClick={insertTable}>Insert 3x3 table</DropdownItem>
            </div>
          )}
        </div>

        <Divider />

        <ToolBtn active={showCodeView} onClick={() => setShowCodeView(v => !v)}><Code size={16} /></ToolBtn>

        <div style={{ marginLeft: 'auto' }}>
          <ToolBtn onClick={() => setIsFullscreen(v => !v)}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </ToolBtn>
        </div>
      </div>

      {/* Table controls — only visible when cursor is inside a table */}
      {insideTable && !showCodeView && (
        <div style={tableToolbarStyle}>
          <span style={tableToolbarLabelStyle}><RowsIcon size={13} /> Row</span>
          <TableBtn onClick={() => editor.chain().focus().addRowBefore().run()}>+ Before</TableBtn>
          <TableBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ After</TableBtn>
          <TableBtn danger onClick={() => editor.chain().focus().deleteRow().run()}>Delete</TableBtn>

          <Divider />

          <span style={tableToolbarLabelStyle}><Columns size={13} /> Col</span>
          <TableBtn onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Before</TableBtn>
          <TableBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ After</TableBtn>
          <TableBtn danger onClick={() => editor.chain().focus().deleteColumn().run()}>Delete</TableBtn>

          <Divider />

          <TableBtn danger onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 size={13} style={{ marginRight: 4 }} /> Delete table
          </TableBtn>
        </div>
      )}

      {/* Body */}
      <div style={isFullscreen ? { flex: 1, overflow: 'auto' } : {}}>
        {showCodeView ? (
          <textarea
            style={codeTextareaStyle}
            value={editor.getHTML()}
            onChange={(e) => {
              onChange(e.target.value);
              editor.commands.setContent(e.target.value, false);
            }}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}

function ToolBtn({ children, onClick, active }) {
  return (
    <button type="button" onClick={onClick} style={{ ...toolBtnStyle, ...(active ? toolBtnActiveStyle : {}) }}>
      {children}
    </button>
  );
}

function TableBtn({ children, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} style={{ ...tableBtnStyle, ...(danger ? tableBtnDangerStyle : {}) }}>
      {children}
    </button>
  );
}

function DropdownItem({ children, onClick, bold }) {
  return (
    <button type="button" onClick={onClick} style={{ ...dropdownItemStyle, fontWeight: bold ? 600 : 400 }}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={dividerStyle} />;
}

// STYLES — matched to the app's existing inline-style system
const editorWrapStyle = { border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', overflow: 'hidden' };
const fullscreenWrapStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' };
const toolbarStyle = { display: 'flex', alignItems: 'center', gap: '2px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '8px', flexWrap: 'wrap', flexShrink: 0 };
const tableToolbarStyle = { display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#eff6ff', padding: '6px 8px', flexWrap: 'wrap', flexShrink: 0 };
const tableToolbarLabelStyle = { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#1e40af', marginRight: '2px' };
const toolBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: 'none', background: 'none', color: '#475569', cursor: 'pointer' };
const toolBtnActiveStyle = { backgroundColor: '#dbeafe', color: '#2563eb' };
const tableBtnStyle = { display: 'flex', alignItems: 'center', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #bfdbfe', background: '#ffffff', color: '#2563eb', cursor: 'pointer', fontWeight: 500 };
const tableBtnDangerStyle = { color: '#dc2626', borderColor: '#fecaca' };
const blockDropdownBtnStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: 'none', background: 'none', color: '#334155', fontSize: '0.85rem', cursor: 'pointer', minWidth: '100px', justifyContent: 'space-between' };
const dropdownMenuStyle = { position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px', overflow: 'hidden' };
const dropdownItemStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '0.85rem', border: 'none', background: 'none', cursor: 'pointer', color: '#1e293b' };
const dividerStyle = { width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 4px' };
const codeTextareaStyle = { width: '100%', minHeight: '150px', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', border: 'none', outline: 'none', boxSizing: 'border-box', resize: 'vertical' };
