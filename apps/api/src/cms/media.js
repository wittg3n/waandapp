import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { ApiError } from '../middleware/errors.js';

const formats = Object.freeze({
  'image/jpeg': { extension: 'jpg' },
  'image/png': { extension: 'png' },
  'image/webp': { extension: 'webp' },
});

function pngDimensions(buffer) {
  if (
    buffer.length < 24 ||
    !buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegDimensions(buffer) {
  if (buffer.length < 10 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const size = buffer.readUInt16BE(offset + 2);
    if (size < 2 || offset + size + 2 > buffer.length) break;
    if (startOfFrame.has(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += size + 2;
  }
  return null;
}

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function webpDimensions(buffer) {
  if (
    buffer.length < 30 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: readUInt24LE(buffer, 24) + 1,
      height: readUInt24LE(buffer, 27) + 1,
    };
  }
  if (chunk === 'VP8L' && buffer[20] === 0x2f) {
    return {
      width: 1 + buffer[21] + ((buffer[22] & 0x3f) << 8),
      height: 1 + (buffer[22] >> 6) + (buffer[23] << 2) + ((buffer[24] & 0x0f) << 10),
    };
  }
  if (
    chunk === 'VP8 ' &&
    buffer[23] === 0x9d &&
    buffer[24] === 0x01 &&
    buffer[25] === 0x2a
  ) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  return null;
}

export function inspectImage(buffer, declaredMimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiError(400, 'CMS_MEDIA_EMPTY', 'An image file is required.');
  }
  if (!formats[declaredMimeType]) {
    throw new ApiError(415, 'CMS_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are supported.');
  }

  const detected = pngDimensions(buffer)
    ? { mimeType: 'image/png', dimensions: pngDimensions(buffer) }
    : jpegDimensions(buffer)
      ? { mimeType: 'image/jpeg', dimensions: jpegDimensions(buffer) }
      : webpDimensions(buffer)
        ? { mimeType: 'image/webp', dimensions: webpDimensions(buffer) }
        : null;

  if (!detected || detected.mimeType !== declaredMimeType) {
    throw new ApiError(415, 'CMS_MEDIA_SIGNATURE', 'The file content does not match its image type.');
  }
  const { width, height } = detected.dimensions;
  if (width < 1 || height < 1 || width > 20000 || height > 20000) {
    throw new ApiError(400, 'CMS_MEDIA_DIMENSIONS', 'Image dimensions are invalid.');
  }
  return { mimeType: detected.mimeType, width, height, extension: formats[detected.mimeType].extension };
}

export function createLocalMediaStorage(settings) {
  const root = resolve(process.cwd(), settings.cmsMediaRoot);

  return {
    async put(buffer, mimeType) {
      const { extension, width, height } = inspectImage(buffer, mimeType);
      const storageKey = randomUUID() + '.' + extension;
      await mkdir(root, { recursive: true });
      await writeFile(resolve(root, storageKey), buffer, { flag: 'wx', mode: 0o640 });
      return { storageKey, width, height };
    },
    async remove(storageKey) {
      await unlink(resolve(root, basename(storageKey))).catch((error) => {
        if (error?.code !== 'ENOENT') throw error;
      });
    },
    path(storageKey) {
      if (basename(storageKey) !== storageKey) {
        throw new ApiError(400, 'CMS_MEDIA_KEY', 'Media storage key is invalid.');
      }
      return resolve(root, storageKey);
    },
  };
}

export function safeOriginalName(value) {
  const clean = [...basename(String(value || 'image'))]
    .filter((character) => {
      const code = character.codePointAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
  return clean.slice(0, 240) || 'image';
}
