import type {
  CommentStatus,
  ContentHistoryAction,
  EditorDocument,
  EditorNode,
  PostStatus,
} from './content.types';

export const postStatusLabels: Record<PostStatus, string> = {
  DRAFT: 'پیش‌نویس',
  IN_REVIEW: 'در انتظار بررسی',
  SCHEDULED: 'زمان‌بندی‌شده',
  PUBLISHED: 'منتشرشده',
  ARCHIVED: 'آرشیوشده',
};

export const commentStatusLabels: Record<CommentStatus, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأییدشده',
  SPAM: 'اسپم',
  TRASHED: 'زباله‌دان',
};

export const historyLabels: Record<ContentHistoryAction, string> = {
  POST_CREATED: 'نوشته ایجاد شد',
  POST_UPDATED: 'نوشته به‌روزرسانی شد',
  POST_SUBMITTED_FOR_REVIEW: 'نوشته برای بررسی ارسال شد',
  POST_PUBLISHED: 'نوشته منتشر شد',
  POST_SCHEDULED: 'نوشته زمان‌بندی شد',
  POST_UNPUBLISHED: 'انتشار نوشته لغو شد',
  POST_ARCHIVED: 'نوشته آرشیو شد',
  POST_REVISION_RESTORED: 'نسخه نوشته بازیابی شد',
  COMMENT_APPROVED: 'دیدگاه تأیید شد',
  COMMENT_MARKED_SPAM: 'دیدگاه اسپم شد',
  COMMENT_TRASHED: 'دیدگاه به زباله‌دان رفت',
  MEDIA_UPDATED: 'رسانه به‌روزرسانی شد',
};

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('fa-IR')
    .replace(/[ي]/gu, 'ی')
    .replace(/[ك]/gu, 'ک')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-{2,}/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 160);
}

function textOf(node: EditorNode): string {
  return `${node.text ?? ''} ${(node.content ?? []).map(textOf).join(' ')}`;
}

export function editorText(document: EditorDocument) {
  return textOf(document).replace(/\s+/gu, ' ').trim();
}

export function wordCount(document: EditorDocument) {
  const text = editorText(document);
  return text ? text.split(/\s+/u).length : 0;
}

export function readingTime(document: EditorDocument) {
  return Math.max(1, Math.ceil(wordCount(document) / 200));
}

export function formatContentDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1_024) return `${bytes.toLocaleString('fa-IR')} بایت`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} کیلوبایت`;
  return `${(bytes / 1_048_576).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`;
}

export const fileSize = formatFileSize;

export function publicPostPath(slug: string) {
  return `/posts/${encodeURIComponent(slug)}`;
}
