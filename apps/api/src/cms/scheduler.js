import mongoose from 'mongoose';

import { recordAdminAudit } from '../admin/audit.js';
import { CmsPost, CmsRevision } from './models.js';
import { cmsPostSnapshot } from './post-service.js';

export async function publishScheduledPosts(now = new Date()) {
  let published = 0;
  while (true) {
    const post = await CmsPost.findOneAndUpdate(
      {
        status: 'SCHEDULED',
        scheduledAt: mongoose.trusted({ $lte: now }),
      },
      {
        $set: {
          status: 'PUBLISHED',
          publishedAt: now,
          scheduledAt: null,
          updatedByUserId: 'SYSTEM',
        },
        $inc: { revisionNumber: 1 },
      },
      { new: true, runValidators: true, sort: { scheduledAt: 1, _id: 1 } },
    );
    if (!post) break;
    await CmsRevision.create({
      postId: post._id,
      number: post.revisionNumber,
      snapshot: cmsPostSnapshot(post),
      reason: 'Scheduled publication',
      actorUserId: 'SYSTEM',
    });
    await recordAdminAudit({
      actorType: 'SYSTEM',
      actorUserId: null,
      action: 'CMS_POST_PUBLISHED',
      resourceType: 'CMS_POST',
      resourceId: post._id,
      before: { status: 'SCHEDULED' },
      after: { status: post.status, publishedAt: post.publishedAt },
      reason: 'Scheduled publication',
    });
    published += 1;
  }
  return published;
}

export function startCmsScheduler({ intervalMs, logger }) {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const published = await publishScheduledPosts();
      if (published > 0) logger.info({ published }, 'Scheduled CMS posts published');
    } catch (error) {
      logger.error({ err: error }, 'CMS scheduler failed');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void run(), intervalMs);
  timer.unref();
  void run();
  return () => clearInterval(timer);
}
