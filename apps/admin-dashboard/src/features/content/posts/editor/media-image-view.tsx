import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { MediaImageOptions } from './media-image-extension';

export function MediaImageView({ node, extension }: NodeViewProps) {
  const media = (extension.options as MediaImageOptions).resolveMedia(String(node.attrs.mediaId));
  if (!media) return <NodeViewWrapper className="cms-editor-missing-media">تصویر در کتابخانه رسانه پیدا نشد.</NodeViewWrapper>;
  return (
    <NodeViewWrapper as="figure" className="cms-editor-media" data-media-id={media.id}>
      <img src={media.url} alt={String(node.attrs.alt || media.alt)} contentEditable={false} />
      {typeof node.attrs.caption === 'string' && node.attrs.caption && <figcaption contentEditable={false}>{node.attrs.caption}</figcaption>}
    </NodeViewWrapper>
  );
}
