import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApplicantProfile } from '@/features/users/types/users.types';

const degreeLabels: Record<string, string> = {
  diploma: 'دیپلم',
  associate: 'کاردانی',
  bachelor: 'کارشناسی',
  master: 'کارشناسی ارشد',
  'professional-doctorate': 'دکتری حرفه‌ای',
  phd: 'دکتری تخصصی',
};

function DataField({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={ltr ? 'mt-1 text-end text-sm font-medium' : 'mt-1 text-sm font-medium'}
      >
        {value}
      </dd>
    </div>
  );
}

export function UserDataTab({ profile }: { profile: ApplicantProfile | null }) {
  return (
    <Card className="rounded-xl border py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">داده‌های کاربر</CardTitle>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <p className="text-sm text-muted-foreground">
            پروفایل تحصیلی یا داده مرتبطی برای این کاربر ثبت نشده است.
          </p>
        ) : (
          <>
            <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              مدل فعلی فقط پروفایل اولیه متقاضی را نگه می‌دارد. دانشگاه و رشته به‌صورت شناسه مرجع
              ثبت شده‌اند و هنوز API یا مسیر مدیریتی مستقلی برای پیوند عمیق آن‌ها وجود ندارد.
            </div>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DataField
                label="مقطع فعلی"
                value={degreeLabels[profile.currentDegree] ?? profile.currentDegree}
              />
              <DataField
                label="وضعیت تحصیل"
                value={profile.studyStatus === 'graduated' ? 'فارغ‌التحصیل' : 'در حال تحصیل'}
              />
              <DataField
                label="معدل"
                value={`${profile.gradeAverage.toLocaleString('fa-IR')} از ${profile.gradeScale}`}
              />
              <DataField label="شناسه رشته فعلی" value={profile.fieldId} ltr />
              <DataField label="شناسه دانشگاه" value={profile.universityId} ltr />
              <DataField label="شناسه رشته هدف" value={profile.targetFieldId} ltr />
              <DataField
                label="مقطع هدف"
                value={degreeLabels[profile.targetDegree] ?? profile.targetDegree}
              />
              <DataField label="کشورهای هدف" value={profile.targetCountries.join('، ')} ltr />
              <DataField
                label="مدرک زبان"
                value={profile.hasLanguageCertificate ? 'دارد' : 'ندارد'}
              />
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
