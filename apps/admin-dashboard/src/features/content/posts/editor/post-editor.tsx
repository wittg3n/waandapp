import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  CodeBlockIcon,
  CodeIcon,
  ImageIcon,
  LinkIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextBIcon,
  TextHOneIcon,
  TextHThreeIcon,
  TextHIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@phosphor-icons/react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MediaPicker } from '../../media/media-picker';
import { readingTime, wordCount } from '../../shared/content-utils';
import type { EditorDocument, MediaAsset } from '../../shared/content.types';
import { MediaImage } from './media-image-extension';

export function PostEditor({ value, media, onChange }: { value: EditorDocument; media: MediaAsset[]; onChange: (value: EditorDocument) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, defaultProtocol: 'https' }),
      MediaImage.configure({ resolveMedia: (id) => media.find((item) => item.id === id) }),
    ],
    content: value,
    editorProps: { attributes: { class: 'cms-post-editor', dir: 'rtl', 'aria-label': 'متن نوشته' } },
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as EditorDocument),
  });

  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) editor.commands.setContent(value);
  }, [editor, value]);

  if (!editor) return <div className="h-72 animate-pulse bg-muted" />;

  const addLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('نشانی پیوند را وارد کنید:', previous ?? 'https://');
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  return (
    <div className="overflow-hidden border bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/40">
      <div className="cms-editor-toolbar sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-background p-2">
        <Tool label="متن معمولی" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><TextHIcon /></Tool>
        <Tool label="عنوان سطح ۲" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><TextHOneIcon /></Tool>
        <Tool label="عنوان سطح ۳" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><TextHThreeIcon /></Tool>
        <span className="mx-1 w-px bg-border" />
        <Tool label="پررنگ" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><TextBIcon /></Tool>
        <Tool label="مورب" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><TextItalicIcon /></Tool>
        <Tool label="خط‌خورده" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><TextStrikethroughIcon /></Tool>
        <Tool label="کد درون‌خطی" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><CodeIcon /></Tool>
        <Tool label="پیوند" active={editor.isActive('link')} onClick={addLink}><LinkIcon /></Tool>
        <span className="mx-1 w-px bg-border" />
        <Tool label="فهرست نشانه‌دار" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><ListBulletsIcon /></Tool>
        <Tool label="فهرست شماره‌دار" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListNumbersIcon /></Tool>
        <Tool label="نقل‌قول" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><QuotesIcon /></Tool>
        <Tool label="بلوک کد" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><CodeBlockIcon /></Tool>
        <Tool label="خط جداکننده" onClick={() => editor.chain().focus().setHorizontalRule().run()}><MinusIcon /></Tool>
        <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}><ImageIcon data-icon="inline-start" />افزودن تصویر</Button>
        <span className="ms-auto flex gap-1">
          <Tool label="واگرد" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><ArrowCounterClockwiseIcon /></Tool>
          <Tool label="بازانجام" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><ArrowClockwiseIcon /></Tool>
        </span>
      </div>
      <EditorContent editor={editor} />
      <footer className="flex flex-wrap justify-between gap-2 border-t bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
        <span>تعداد واژه: {wordCount(value).toLocaleString('fa-IR')}</span>
        <span>زمان تقریبی مطالعه: {readingTime(value).toLocaleString('fa-IR')} دقیقه</span>
      </footer>
      {pickerOpen && <MediaPicker media={media} title="افزودن تصویر به متن" onClose={() => setPickerOpen(false)} onSelect={(asset) => { editor.chain().focus().insertMediaImage({ mediaId: asset.id, alt: asset.alt, caption: asset.caption }).run(); setPickerOpen(false); }} />}
    </div>
  );
}

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <Button type="button" size="icon-sm" variant={active ? 'secondary' : 'ghost'} disabled={disabled} onClick={onClick} title={label} aria-label={label} className={cn(active && 'text-foreground')}>{children}</Button>;
}
