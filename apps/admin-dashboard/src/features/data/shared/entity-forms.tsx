import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dataRepository } from '../services/data-repository';
import type {
  Admission,
  Major,
  Program,
  ProgramRow,
  Source,
  University,
} from '../types/data.types';
import {
  degreeLabels,
  examGroupLabels,
  sourceTypeLabels,
  universityTypeLabels,
} from './data-utils';
import { selectClassName } from './data-ui';

type FormKind = 'university' | 'major' | 'program' | 'admission' | 'source';
type FormEntity = University | Major | Program | Admission | Source;

export function EntityFormDialog({
  kind,
  entity,
  universities = [],
  majors = [],
  programs = [],
  sources = [],
  onClose,
  onSaved,
}: {
  kind: FormKind;
  entity?: FormEntity;
  universities?: University[];
  majors?: Major[];
  programs?: ProgramRow[];
  sources?: Source[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labels: Record<FormKind, string> = {
    university: 'دانشگاه',
    major: 'رشته',
    program: 'برنامه دانشگاهی',
    admission: 'پذیرش',
    source: 'منبع',
  };

  async function submit(form: HTMLFormElement) {
    const values = new FormData(form);
    const text = (name: string) => String(values.get(name) ?? '').trim();
    const list = (name: string) =>
      text(name)
        .split('،')
        .flatMap((part) => part.split(','))
        .map((part) => part.trim())
        .filter(Boolean);
    setBusy(true);
    setError(null);
    try {
      if (kind === 'university') {
        await dataRepository.saveUniversity(
          {
            nameFa: text('nameFa'),
            nameEn: text('nameEn') || undefined,
            aliases: list('aliases'),
            countryCode: text('countryCode'),
            province: text('province') || undefined,
            city: text('city') || undefined,
            website: text('website') || undefined,
            type: text('type') as University['type'],
            status: text('status') as University['status'],
            sourceIds: values.getAll('sourceIds').map(String),
          },
          entity?.id,
        );
      } else if (kind === 'major') {
        await dataRepository.saveMajor(
          {
            nameFa: text('nameFa'),
            nameEn: text('nameEn') || undefined,
            aliases: list('aliases'),
            status: text('status') as Major['status'],
            sourceIds: values.getAll('sourceIds').map(String),
          },
          entity?.id,
        );
      } else if (kind === 'program') {
        await dataRepository.saveProgram(
          {
            universityId: text('universityId'),
            majorId: text('majorId'),
            degreeLevel: text('degreeLevel') as Program['degreeLevel'],
            titleFa: text('titleFa') || undefined,
            status: text('status') as Program['status'],
            sourceIds: values.getAll('sourceIds').map(String),
          },
          entity?.id,
        );
      } else if (kind === 'admission') {
        await dataRepository.saveAdmission(
          {
            programId: text('programId'),
            sourceId: text('sourceId'),
            year: Number(text('year')),
            examGroup: (text('examGroup') || undefined) as Admission['examGroup'],
            admissionCode: text('admissionCode') || undefined,
            capacity: text('capacity') ? Number(text('capacity')) : undefined,
            admissionType: text('admissionType') || undefined,
            notes: text('notes') || undefined,
            status: text('status') as Admission['status'],
          },
          entity?.id,
        );
      } else {
        await dataRepository.saveSource(
          {
            title: text('title'),
            type: text('type') as Source['type'],
            year: text('year') ? Number(text('year')) : undefined,
            examGroup: (text('examGroup') || undefined) as Source['examGroup'],
            filename: text('filename') || undefined,
            sourceUrl: text('sourceUrl') || undefined,
            status: text('status') as Source['status'],
          },
          entity?.id,
        );
      }
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ذخیره انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  const universityEntity = kind === 'university' ? (entity as University | undefined) : undefined;
  const majorEntity = kind === 'major' ? (entity as Major | undefined) : undefined;
  const programEntity = kind === 'program' ? (entity as Program | undefined) : undefined;
  const admissionEntity = kind === 'admission' ? (entity as Admission | undefined) : undefined;
  const sourceEntity = kind === 'source' ? (entity as Source | undefined) : undefined;
  const field = 'grid gap-1.5 text-sm';

  return (
    <motion.dialog
      open
      dir="rtl"
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(44rem,calc(100%-2rem))] overflow-y-auto rounded-none border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(event.currentTarget);
        }}
      >
        <div>
          <h2 className="text-lg font-semibold">
            {entity ? 'ویرایش' : 'افزودن'} {labels[kind]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            تغییرات این نشست در حافظه اعمال می‌شود و با تازه‌سازی صفحه بازنشانی خواهد شد.
          </p>
        </div>
        {kind === 'university' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={field}>
              نام فارسی
              <Input name="nameFa" required defaultValue={universityEntity?.nameFa} />
            </label>
            <label className={field}>
              نام انگلیسی
              <Input name="nameEn" dir="ltr" defaultValue={universityEntity?.nameEn} />
            </label>
            <label className={field}>
              نام‌های جایگزین
              <Input name="aliases" defaultValue={universityEntity?.aliases.join('، ')} />
            </label>
            <label className={field}>
              کشور
              <Input
                name="countryCode"
                required
                dir="ltr"
                defaultValue={universityEntity?.countryCode ?? 'IR'}
              />
            </label>
            <label className={field}>
              استان
              <Input name="province" defaultValue={universityEntity?.province} />
            </label>
            <label className={field}>
              شهر
              <Input name="city" defaultValue={universityEntity?.city} />
            </label>
            <label className={field}>
              نوع
              <select
                name="type"
                className={selectClassName}
                defaultValue={universityEntity?.type ?? 'PUBLIC'}
              >
                {Object.entries(universityTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              وب‌سایت
              <Input name="website" dir="ltr" defaultValue={universityEntity?.website} />
            </label>
            <StatusSelect defaultValue={universityEntity?.status} />
            <SourceSelect sources={sources} selected={universityEntity?.sourceIds} multiple />
          </div>
        )}
        {kind === 'major' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={field}>
              نام فارسی
              <Input name="nameFa" required defaultValue={majorEntity?.nameFa} />
            </label>
            <label className={field}>
              نام انگلیسی
              <Input name="nameEn" dir="ltr" defaultValue={majorEntity?.nameEn} />
            </label>
            <label className={field}>
              نام‌های جایگزین
              <Input name="aliases" defaultValue={majorEntity?.aliases.join('، ')} />
            </label>
            <StatusSelect defaultValue={majorEntity?.status} />
            <SourceSelect sources={sources} selected={majorEntity?.sourceIds} multiple />
          </div>
        )}
        {kind === 'program' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={field}>
              دانشگاه
              <select
                required
                name="universityId"
                className={selectClassName}
                defaultValue={programEntity?.universityId ?? ''}
              >
                <option value="" disabled>
                  انتخاب دانشگاه
                </option>
                {universities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameFa}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              رشته
              <select
                required
                name="majorId"
                className={selectClassName}
                defaultValue={programEntity?.majorId ?? ''}
              >
                <option value="" disabled>
                  انتخاب رشته
                </option>
                {majors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameFa}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              مقطع
              <select
                required
                name="degreeLevel"
                className={selectClassName}
                defaultValue={programEntity?.degreeLevel ?? 'BACHELOR'}
              >
                {Object.entries(degreeLabels)
                  .filter(([value]) => value !== 'UNKNOWN')
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </select>
            </label>
            <label className={field}>
              عنوان نمایشی
              <Input
                name="titleFa"
                defaultValue={programEntity?.titleFa}
                placeholder="در صورت خالی بودن ساخته می‌شود"
              />
            </label>
            <StatusSelect defaultValue={programEntity?.status} />
            <SourceSelect sources={sources} selected={programEntity?.sourceIds} multiple />
          </div>
        )}
        {kind === 'admission' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={field}>
              برنامه
              <select
                required
                name="programId"
                className={selectClassName}
                defaultValue={admissionEntity?.programId ?? ''}
              >
                <option value="" disabled>
                  انتخاب برنامه
                </option>
                {programs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.titleFa} — {item.university.nameFa}
                  </option>
                ))}
              </select>
            </label>
            <SourceSelect
              sources={sources}
              selected={admissionEntity ? [admissionEntity.sourceId] : undefined}
            />
            <label className={field}>
              سال
              <Input
                name="year"
                required
                type="number"
                defaultValue={admissionEntity?.year ?? 1404}
              />
            </label>
            <label className={field}>
              گروه آزمایشی
              <select
                name="examGroup"
                className={selectClassName}
                defaultValue={admissionEntity?.examGroup ?? ''}
              >
                <option value="">بدون گروه</option>
                {Object.entries(examGroupLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              کد پذیرش
              <Input name="admissionCode" dir="ltr" defaultValue={admissionEntity?.admissionCode} />
            </label>
            <label className={field}>
              ظرفیت
              <Input
                name="capacity"
                type="number"
                min="0"
                defaultValue={admissionEntity?.capacity}
              />
            </label>
            <label className={field}>
              نوع پذیرش
              <Input name="admissionType" defaultValue={admissionEntity?.admissionType} />
            </label>
            <StatusSelect defaultValue={admissionEntity?.status} />
            <label className={`${field} sm:col-span-2`}>
              یادداشت
              <textarea
                name="notes"
                className="min-h-20 rounded-lg border bg-background p-2"
                defaultValue={admissionEntity?.notes}
              />
            </label>
          </div>
        )}
        {kind === 'source' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={field}>
              عنوان
              <Input name="title" required defaultValue={sourceEntity?.title} />
            </label>
            <label className={field}>
              نوع
              <select
                required
                name="type"
                className={selectClassName}
                defaultValue={sourceEntity?.type ?? 'MANUAL'}
              >
                {Object.entries(sourceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              سال
              <Input name="year" type="number" defaultValue={sourceEntity?.year} />
            </label>
            <label className={field}>
              گروه آزمایشی
              <select
                name="examGroup"
                className={selectClassName}
                defaultValue={sourceEntity?.examGroup ?? ''}
              >
                <option value="">بدون گروه</option>
                {Object.entries(examGroupLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              نام فایل
              <Input name="filename" dir="ltr" defaultValue={sourceEntity?.filename} />
            </label>
            <label className={field}>
              نشانی منبع
              <Input name="sourceUrl" dir="ltr" defaultValue={sourceEntity?.sourceUrl} />
            </label>
            <label className={field}>
              وضعیت
              <select
                name="status"
                className={selectClassName}
                defaultValue={sourceEntity?.status ?? 'ACTIVE'}
              >
                <option value="ACTIVE">فعال</option>
                <option value="SUPERSEDED">جایگزین‌شده</option>
                <option value="ARCHIVED">آرشیوشده</option>
              </select>
            </label>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'در حال ذخیره…' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </motion.dialog>
  );
}

function StatusSelect({ defaultValue = 'ACTIVE' }: { defaultValue?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      وضعیت
      <select name="status" className={selectClassName} defaultValue={defaultValue}>
        <option value="ACTIVE">فعال</option>
        <option value="INACTIVE">غیرفعال</option>
        <option value="ARCHIVED">آرشیوشده</option>
      </select>
    </label>
  );
}

function SourceSelect({
  sources,
  selected = [],
  multiple = false,
}: {
  sources: Source[];
  selected?: string[];
  multiple?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      منبع
      <select
        required={!multiple}
        multiple={multiple}
        name={multiple ? 'sourceIds' : 'sourceId'}
        className={multiple ? `${selectClassName} h-24` : selectClassName}
        defaultValue={multiple ? selected : (selected[0] ?? '')}
      >
        {!multiple && (
          <option value="" disabled>
            انتخاب منبع
          </option>
        )}
        {sources.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
  );
}
