"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api/admin";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Paperclip,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  Undo2,
  Redo2,
  Palette,
  Highlighter,
  Type,
  FileCode2,
  RemoveFormatting,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** min height of the editing surface */
  minHeight?: number;
};

const COLORS = [
  "#000000",
  "#374151",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const FONT_SIZES = [
  { label: "S", value: "12px" },
  { label: "M", value: "14px" },
  { label: "L", value: "16px" },
  { label: "XL", value: "20px" },
  { label: "2XL", value: "24px" },
];

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
        active && "bg-white/15 text-foreground"
      )}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-white/10" aria-hidden />;
}

function ColorMenu({
  title,
  icon,
  colors,
  onPick,
  onClear,
}: {
  title: string;
  icon: React.ReactNode;
  colors: string[];
  onPick: (c: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <ToolBtn title={title} onClick={() => setOpen((v) => !v)} active={open}>
        {icon}
      </ToolBtn>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-white/15 bg-[var(--bg-elevated,#1a1a22)] p-2 shadow-xl">
          <div className="grid grid-cols-6 gap-1">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                className="h-5 w-5 rounded border border-white/20"
                style={{ background: c }}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/10"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function FontSizeMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <ToolBtn title="Font size" onClick={() => setOpen((v) => !v)} active={open}>
        <Type className="h-4 w-4" />
      </ToolBtn>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 flex gap-1 rounded-lg border border-white/15 bg-[var(--bg-elevated,#1a1a22)] p-1.5 shadow-xl">
          {FONT_SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
              onClick={() => {
                editor.chain().focus().setFontSize(s.value).run();
                setOpen(false);
              }}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/10"
            onClick={() => {
              editor.chain().focus().unsetFontSize().run();
              setOpen(false);
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

function Toolbar({
  editor,
  sourceMode,
  onToggleSource,
  uploading,
}: {
  editor: Editor;
  sourceMode: boolean;
  onToggleSource: () => void;
  uploading: boolean;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim(), target: "_blank" })
      .run();
  }, [editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        const res = await adminApi.uploadImage(file);
        if (!res?.success || !res.file_path) {
          toast.error(res?.msg || "Image upload failed");
          return;
        }
        editor
          .chain()
          .focus()
          .setImage({ src: res.file_path, alt: file.name })
          .run();
      } catch {
        toast.error("Image upload failed");
      }
    },
    [editor]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const res = await adminApi.uploadFile(file);
        if (!res?.success || !res.file_path) {
          toast.error(res?.msg || "File upload failed");
          return;
        }
        const name = res.file_name || file.name;
        const href = res.file_path;
        editor
          .chain()
          .focus()
          .insertContent(
            `<p><a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a></p>`
          )
          .run();
      } catch {
        toast.error("File upload failed");
      }
    },
    [editor]
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 p-1.5">
      <ToolBtn
        title="Undo"
        disabled={sourceMode || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Redo"
        disabled={sourceMode || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Heading 1"
        disabled={sourceMode}
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Heading 2"
        disabled={sourceMode}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Heading 3"
        disabled={sourceMode}
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Bold"
        disabled={sourceMode}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Italic"
        disabled={sourceMode}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Underline"
        disabled={sourceMode}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Strikethrough"
        disabled={sourceMode}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      {!sourceMode && <FontSizeMenu editor={editor} />}
      {!sourceMode && (
        <ColorMenu
          title="Text color"
          icon={<Palette className="h-4 w-4" />}
          colors={COLORS}
          onPick={(c) => editor.chain().focus().setColor(c).run()}
          onClear={() => editor.chain().focus().unsetColor().run()}
        />
      )}
      {!sourceMode && (
        <ColorMenu
          title="Highlight"
          icon={<Highlighter className="h-4 w-4" />}
          colors={COLORS.filter((c) => c !== "#000000")}
          onPick={(c) =>
            editor.chain().focus().toggleHighlight({ color: c }).run()
          }
          onClear={() => editor.chain().focus().unsetHighlight().run()}
        />
      )}

      <Divider />

      <ToolBtn
        title="Bullet list"
        disabled={sourceMode}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Ordered list"
        disabled={sourceMode}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Indent"
        disabled={sourceMode}
        onClick={() =>
          editor.chain().focus().sinkListItem("listItem").run() ||
          editor.chain().focus().run()
        }
      >
        <IndentIncrease className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Outdent"
        disabled={sourceMode}
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
      >
        <IndentDecrease className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Blockquote"
        disabled={sourceMode}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Inline code"
        disabled={sourceMode}
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Code block"
        disabled={sourceMode}
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Horizontal rule"
        disabled={sourceMode}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Link"
        disabled={sourceMode}
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Remove link"
        disabled={sourceMode || !editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Unlink className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Insert image"
        disabled={sourceMode || uploading}
        onClick={() => imageInputRef.current?.click()}
      >
        <ImageIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Upload file"
        disabled={sourceMode || uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Insert table"
        disabled={sourceMode}
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Align left"
        disabled={sourceMode}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Align center"
        disabled={sourceMode}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Align right"
        disabled={sourceMode}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="Justify"
        disabled={sourceMode}
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Clear formatting"
        disabled={sourceMode}
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        <RemoveFormatting className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title={sourceMode ? "Visual editor" : "HTML source"}
        active={sourceMode}
        onClick={onToggleSource}
      >
        <FileCode2 className="h-4 w-4" />
      </ToolBtn>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/gif,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) await uploadImage(f);
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) await uploadFile(f);
        }}
      />
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write…",
  className,
  minHeight = 160,
}: Props) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const lastEmitted = useRef(value || "");
  const editorRef = useRef<Editor | null>(null);

  const insertUploadedImage = useCallback(async (file: File) => {
    const ed = editorRef.current;
    if (!ed) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      if (!res?.success || !res.file_path) {
        toast.error(res?.msg || "Image upload failed");
        return;
      }
      ed.chain().focus().setImage({ src: res.file_path, alt: file.name }).run();
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "rich-editor-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "rich-editor-prose markdown-body max-w-none px-3 py-2 focus:outline-none",
          "min-h-[var(--rte-min-h)]"
        ),
        style: `--rte-min-h: ${minHeight}px`,
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (!file) continue;
            event.preventDefault();
            void insertUploadedImage(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        void insertUploadedImage(file);
        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor || sourceMode) return;
    const incoming = value || "";
    if (incoming !== lastEmitted.current && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false });
      lastEmitted.current = incoming;
    }
  }, [value, editor, sourceMode]);

  const toggleSource = useCallback(() => {
    if (!editor) return;
    if (!sourceMode) {
      setSourceHtml(editor.getHTML());
      setSourceMode(true);
    } else {
      editor.commands.setContent(sourceHtml || "", { emitUpdate: false });
      lastEmitted.current = sourceHtml || "";
      onChange(sourceHtml || "");
      setSourceMode(false);
    }
  }, [editor, sourceMode, sourceHtml, onChange]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 overflow-hidden",
        className
      )}
    >
      <Toolbar
        editor={editor}
        sourceMode={sourceMode}
        onToggleSource={toggleSource}
        uploading={uploading}
      />

      {sourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={(e) => {
            setSourceHtml(e.target.value);
            lastEmitted.current = e.target.value;
            onChange(e.target.value);
          }}
          className="w-full resize-y bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {uploading && (
        <div className="border-t border-white/10 px-3 py-1.5 text-xs text-muted-foreground">
          Uploading…
        </div>
      )}
    </div>
  );
}
