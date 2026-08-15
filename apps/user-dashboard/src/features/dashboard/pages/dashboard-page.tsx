import { motion, type Variants } from 'framer-motion';

import { useAuth } from '@/features/auth/auth-context';
import { AiInsights } from '@/features/dashboard/components/ai-insight-card';
import { ApplicationPipeline } from '@/features/dashboard/components/application-journey';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { DeadlinePreview } from '@/features/dashboard/components/deadline-preview';
import { DocumentHealthCard } from '@/features/dashboard/components/document-health';
import { AttentionQueue } from '@/features/dashboard/components/next-actions';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { RecommendationPreview } from '@/features/dashboard/components/university-recommendations';
import { applicationDashboardData } from '@/features/dashboard/data/application-dashboard';

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
};

export function DashboardPage() {
  const { user } = useAuth();
  const data = applicationDashboardData;
  const firstName = user?.fullName.trim().split(/\s+/)[0] || 'دوست عزیز';

  const showPipeline = data.phase !== 'new-user' || data.pipeline.some((stage) => stage.count > 0);
  const showRecommendations = data.phase !== 'submitted' && data.recommendations.length > 0;
  const showDeadlines =
    (data.phase === 'applications-started' || data.phase === 'submitted') &&
    data.deadlines.length > 0;
  const showDocumentHealth =
    data.phase !== 'submitted' &&
    (data.documentHealth.needsReview > 0 || data.documentHealth.incomplete > 0);

  return (
    <motion.div
      animate="visible"
      className="mx-auto w-full max-w-[1460px] pb-3"
      initial="hidden"
      variants={container}
    >
      <motion.div variants={item}>
        <DashboardHeader summary={data.summary} userName={firstName} />
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <motion.div className="min-w-0 xl:col-span-5" variants={item}>
          <AttentionQueue actions={data.nextActions} />
        </motion.div>
        {showPipeline && (
          <motion.div className="min-w-0 xl:col-span-7" variants={item}>
            <ApplicationPipeline stages={data.pipeline} />
          </motion.div>
        )}
      </div>

      {showRecommendations && (
        <motion.div className="mt-7" variants={item}>
          <RecommendationPreview recommendations={data.recommendations} />
        </motion.div>
      )}

      <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <motion.div className="min-w-0 xl:col-span-7" variants={item}>
          <AiInsights insights={data.insights} />
        </motion.div>
        {showDeadlines && (
          <motion.div className="min-w-0 xl:col-span-5" variants={item}>
            <DeadlinePreview deadlines={data.deadlines} />
          </motion.div>
        )}
      </div>

      {(showDocumentHealth || data.recentActivity.length > 0) && (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12">
          {showDocumentHealth && (
            <motion.div className="min-w-0 xl:col-span-5" variants={item}>
              <DocumentHealthCard health={data.documentHealth} />
            </motion.div>
          )}
          {data.recentActivity.length > 0 && (
            <motion.div
              className={showDocumentHealth ? 'min-w-0 xl:col-span-7' : 'min-w-0 xl:col-span-12'}
              variants={item}
            >
              <RecentActivity items={data.recentActivity} />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
