import { Node, mergeAttributes, type Editor } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { MediaAsset } from '../../shared/content.types';
import { MediaImageView } from './media-image-view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mediaImage: {
      insertMediaImage: (attributes: { mediaId: string; alt: string; caption?: string }) => ReturnType;
    };
  }
}

export interface MediaImageOptions {
  resolveMedia: (id: string) => MediaAsset | undefined;
}

export const MediaImage = Node.create<MediaImageOptions>({
  name: 'mediaImage',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { resolveMedia: () => undefined };
  },

  addAttributes() {
    return {
      mediaId: { default: '' },
      alt: { default: '' },
      caption: { default: undefined },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-media-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-media-id': HTMLAttributes.mediaId })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaImageView);
  },

  addCommands() {
    return {
      insertMediaImage:
        (attributes) =>
        ({ commands }: { commands: Editor['commands'] }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },
});
