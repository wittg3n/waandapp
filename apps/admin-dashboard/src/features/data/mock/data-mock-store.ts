import {
  admissionsSeed,
  historySeed,
  importsSeed,
  majorsSeed,
  programsSeed,
  qualityIssuesSeed,
  rawRecordsSeed,
  sourcesSeed,
  universitiesSeed,
} from './data.mock.ts';
import type {
  Admission,
  AdmissionRow,
  DataHistoryEvent,
  DataQualityIssue,
  DataRepository,
  DegreeLevel,
  EntityId,
  ImportAction,
  ImportJob,
  Major,
  MajorRow,
  PageResult,
  Program,
  ProgramRow,
  QualityResolution,
  Source,
  SourceRow,
  University,
  UniversityRow,
} from '../types/data.types.ts';

const state = {
  universities: structuredClone(universitiesSeed),
  majors: structuredClone(majorsSeed),
  programs: structuredClone(programsSeed),
  admissions: structuredClone(admissionsSeed),
  sources: structuredClone(sourcesSeed),
  imports: structuredClone(importsSeed),
  rawRecords: structuredClone(rawRecordsSeed),
  issues: structuredClone(qualityIssuesSeed),
  history: structuredClone(historySeed),
};
let sequence = 1000;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence.toString(36)}`;
}

function wait(signal?: AbortSignal, duration = 260) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timeout = globalThis.setTimeout(resolve, duration);
    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function required<T>(value: T | undefined, message = 'رکورد موردنظر پیدا نشد.'): T {
  if (!value) throw new Error(message);
  return value;
}

function maybeMockError(params: URLSearchParams) {
  if (params.get('error') === 'true') throw new Error('خطای آزمایشی در دریافت داده‌ها.');
}

function paginate<T>(items: T[], params: URLSearchParams): PageResult<T> {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const requestedSize = Number(params.get('pageSize')) || 20;
  const pageSize = [20, 50, 100].includes(requestedSize) ? requestedSize : 20;
  return {
    items: clone(items.slice((page - 1) * pageSize, page * pageSize)),
    page,
    pageSize,
    total: items.length,
    pageCount: Math.ceil(items.length / pageSize),
  };
}

function includesSearch(values: Array<string | undefined>, search: string | null) {
  if (!search) return true;
  const needle = search.trim().toLocaleLowerCase('fa-IR');
  return values.join(' ').toLocaleLowerCase('fa-IR').includes(needle);
}

function sortRows<T>(items: T[], params: URLSearchParams, fallback: keyof T) {
  const key = (params.get('sort') || fallback) as keyof T;
  const direction = params.get('order') === 'asc' ? 1 : -1;
  return [...items].sort(
    (left, right) =>
      String(left[key] ?? '').localeCompare(String(right[key] ?? ''), 'fa') * direction,
  );
}

function university(id: EntityId) {
  return required(state.universities.find((item) => item.id === id));
}

function major(id: EntityId) {
  return required(state.majors.find((item) => item.id === id));
}

function program(id: EntityId) {
  return required(state.programs.find((item) => item.id === id));
}

function source(id: EntityId) {
  return required(state.sources.find((item) => item.id === id));
}

function programRow(item: Program): ProgramRow {
  return {
    ...item,
    university: university(item.universityId),
    major: major(item.majorId),
    admissionCount: state.admissions.filter((admission) => admission.programId === item.id).length,
    activeAdmissionCount: state.admissions.filter(
      (admission) => admission.programId === item.id && admission.status === 'ACTIVE',
    ).length,
    issueCount: state.issues.filter(
      (issue) =>
        issue.entityType === 'PROGRAM' && issue.entityId === item.id && issue.status === 'OPEN',
    ).length,
  };
}

function admissionRow(item: Admission): AdmissionRow {
  const linkedProgram = program(item.programId);
  return {
    ...item,
    program: linkedProgram,
    university: university(linkedProgram.universityId),
    major: major(linkedProgram.majorId),
    source: source(item.sourceId),
  };
}

function universityRow(item: University): UniversityRow {
  return {
    ...item,
    programCount: state.programs.filter((program) => program.universityId === item.id).length,
    issueCount: state.issues.filter(
      (issue) =>
        issue.entityType === 'UNIVERSITY' && issue.entityId === item.id && issue.status === 'OPEN',
    ).length,
  };
}

function majorRow(item: Major): MajorRow {
  const programs = state.programs.filter((program) => program.majorId === item.id);
  return {
    ...item,
    programCount: programs.length,
    universityCount: new Set(programs.map((program) => program.universityId)).size,
    issueCount: state.issues.filter(
      (issue) =>
        issue.entityType === 'MAJOR' && issue.entityId === item.id && issue.status === 'OPEN',
    ).length,
  };
}

function sourceRow(item: Source): SourceRow {
  const relatedRecordCount =
    state.universities.filter((entity) => entity.sourceIds.includes(item.id)).length +
    state.majors.filter((entity) => entity.sourceIds.includes(item.id)).length +
    state.programs.filter((entity) => entity.sourceIds.includes(item.id)).length +
    state.admissions.filter((entity) => entity.sourceId === item.id).length;
  const latestImport = state.imports
    .filter((job) => job.sourceId === item.id)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0];
  return { ...item, relatedRecordCount, ...(latestImport ? { latestImport } : {}) };
}

function addHistory(
  entityType: DataHistoryEvent['entityType'],
  entityId: string,
  title: string,
  description?: string,
) {
  state.history.unshift({
    id: id('history'),
    entityType,
    entityId,
    title,
    ...(description ? { description } : {}),
    createdAt: now(),
  });
}

function titleForProgram(universityId: string, majorId: string, degreeLevel: DegreeLevel) {
  const degree = {
    ASSOCIATE: 'کاردانی',
    BACHELOR: 'کارشناسی',
    MASTER: 'کارشناسی ارشد',
    PHD: 'دکتری',
    INTEGRATED: 'پیوسته',
    OTHER: 'سایر',
    UNKNOWN: 'نامشخص',
  }[degreeLevel];
  return `${degree} ${major(majorId).nameFa} — ${university(universityId).nameFa}`;
}

function setIssueResolved(issue: DataQualityIssue, note: string) {
  issue.status = 'RESOLVED';
  issue.resolvedAt = now();
  issue.resolutionNote = note;
  addHistory(
    issue.entityType,
    issue.entityId ?? issue.rawRecordId ?? issue.importId ?? issue.id,
    'مشکل داده حل شد',
    note,
  );
  return issue;
}

export const mockDataRepository: DataRepository = {
  async listUniversities(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.universities
      .map(universityRow)
      .filter((item) =>
        includesSearch([item.nameFa, item.nameEn, ...item.aliases], params.get('search')),
      );
    for (const [param, field] of [
      ['country', 'countryCode'],
      ['province', 'province'],
      ['type', 'type'],
      ['status', 'status'],
    ] as const) {
      const value = params.get(param);
      if (value) items = items.filter((item) => item[field] === value);
    }
    if (params.get('qualityOnly') === 'true') items = items.filter((item) => item.issueCount > 0);
    return paginate(sortRows(items, params, 'updatedAt'), params);
  },

  async getUniversity(entityId, signal) {
    await wait(signal);
    const entity = university(entityId);
    return clone({
      university: entity,
      programs: state.programs.filter((item) => item.universityId === entityId).map(programRow),
      sources: entity.sourceIds.map(source),
      issues: state.issues.filter(
        (issue) => issue.entityType === 'UNIVERSITY' && issue.entityId === entityId,
      ),
      history: state.history.filter(
        (event) => event.entityType === 'UNIVERSITY' && event.entityId === entityId,
      ),
    });
  },

  async saveUniversity(input, entityId) {
    await wait(undefined, 380);
    if (!input.nameFa.trim() || !input.countryCode.trim())
      throw new Error('نام فارسی و کشور الزامی است.');
    const timestamp = now();
    if (entityId) {
      const entity = university(entityId);
      Object.assign(entity, input, { updatedAt: timestamp });
      addHistory('UNIVERSITY', entityId, 'دانشگاه ویرایش شد');
      return clone(entity);
    }
    const entity: University = {
      id: id('university'),
      aliases: [],
      sourceIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };
    state.universities.unshift(entity);
    addHistory('UNIVERSITY', entity.id, 'دانشگاه افزوده شد');
    return clone(entity);
  },

  async archiveUniversity(entityId) {
    await wait(undefined, 320);
    const entity = university(entityId);
    entity.status = 'ARCHIVED';
    entity.updatedAt = now();
    addHistory('UNIVERSITY', entityId, 'دانشگاه آرشیو شد');
  },

  async listMajors(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.majors
      .map(majorRow)
      .filter((item) =>
        includesSearch([item.nameFa, item.nameEn, ...item.aliases], params.get('search')),
      );
    const status = params.get('status');
    if (status) items = items.filter((item) => item.status === status);
    return paginate(sortRows(items, params, 'updatedAt'), params);
  },

  async getMajor(entityId, signal) {
    await wait(signal);
    const entity = major(entityId);
    const programs = state.programs.filter((item) => item.majorId === entityId).map(programRow);
    return clone({
      major: entity,
      programs,
      universities: [
        ...new Map(programs.map((item) => [item.university.id, item.university])).values(),
      ],
      sources: entity.sourceIds.map(source),
      issues: state.issues.filter(
        (issue) => issue.entityType === 'MAJOR' && issue.entityId === entityId,
      ),
      history: state.history.filter(
        (event) => event.entityType === 'MAJOR' && event.entityId === entityId,
      ),
    });
  },

  async saveMajor(input, entityId) {
    await wait(undefined, 380);
    if (!input.nameFa.trim()) throw new Error('نام فارسی رشته الزامی است.');
    const timestamp = now();
    if (entityId) {
      const entity = major(entityId);
      Object.assign(entity, input, { updatedAt: timestamp });
      addHistory('MAJOR', entityId, 'رشته ویرایش شد');
      return clone(entity);
    }
    const entity: Major = {
      id: id('major'),
      aliases: [],
      sourceIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };
    state.majors.unshift(entity);
    addHistory('MAJOR', entity.id, 'رشته افزوده شد');
    return clone(entity);
  },

  async archiveMajor(entityId) {
    await wait(undefined, 320);
    const entity = major(entityId);
    entity.status = 'ARCHIVED';
    entity.updatedAt = now();
    addHistory('MAJOR', entityId, 'رشته آرشیو شد');
  },

  async listPrograms(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.programs
      .map(programRow)
      .filter((item) =>
        includesSearch(
          [item.titleFa, item.university.nameFa, item.major.nameFa],
          params.get('search'),
        ),
      );
    for (const [param, field] of [
      ['university', 'universityId'],
      ['major', 'majorId'],
      ['degree', 'degreeLevel'],
      ['status', 'status'],
    ] as const) {
      const value = params.get(param);
      if (value) items = items.filter((item) => item[field] === value);
    }
    const sourceId = params.get('source');
    if (sourceId) items = items.filter((item) => item.sourceIds.includes(sourceId));
    return paginate(sortRows(items, params, 'updatedAt'), params);
  },

  async getProgram(entityId, signal) {
    await wait(signal);
    const entity = programRow(program(entityId));
    return clone({
      program: entity,
      admissions: state.admissions.filter((item) => item.programId === entityId).map(admissionRow),
      sources: entity.sourceIds.map(source),
      issues: state.issues.filter(
        (issue) => issue.entityType === 'PROGRAM' && issue.entityId === entityId,
      ),
      history: state.history.filter(
        (event) => event.entityType === 'PROGRAM' && event.entityId === entityId,
      ),
    });
  },

  async saveProgram(input, entityId) {
    await wait(undefined, 400);
    university(input.universityId);
    major(input.majorId);
    const duplicate = state.programs.some(
      (item) =>
        item.id !== entityId &&
        item.universityId === input.universityId &&
        item.majorId === input.majorId &&
        item.degreeLevel === input.degreeLevel,
    );
    if (duplicate) throw new Error('این ترکیب دانشگاه، رشته و مقطع قبلاً ثبت شده است.');
    const timestamp = now();
    const values = {
      ...input,
      titleFa:
        input.titleFa?.trim() ||
        titleForProgram(input.universityId, input.majorId, input.degreeLevel),
      sourceIds: input.sourceIds ?? [],
    };
    if (entityId) {
      const entity = program(entityId);
      Object.assign(entity, values, { updatedAt: timestamp });
      addHistory('PROGRAM', entityId, 'برنامه دانشگاهی ویرایش شد');
      return clone(entity);
    }
    const entity: Program = {
      id: id('program'),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...values,
    };
    state.programs.unshift(entity);
    addHistory('PROGRAM', entity.id, 'برنامه دانشگاهی افزوده شد');
    return clone(entity);
  },

  async archiveProgram(entityId) {
    await wait(undefined, 320);
    const entity = program(entityId);
    entity.status = 'ARCHIVED';
    entity.updatedAt = now();
    addHistory('PROGRAM', entityId, 'برنامه دانشگاهی آرشیو شد');
  },

  async listAdmissions(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.admissions
      .map(admissionRow)
      .filter((item) =>
        includesSearch(
          [item.admissionCode, item.program.titleFa, item.university.nameFa, item.major.nameFa],
          params.get('search'),
        ),
      );
    const filters: Array<[string, (item: AdmissionRow) => string | number | undefined]> = [
      ['year', (item) => item.year],
      ['university', (item) => item.university.id],
      ['major', (item) => item.major.id],
      ['degree', (item) => item.program.degreeLevel],
      ['examGroup', (item) => item.examGroup],
      ['source', (item) => item.sourceId],
      ['status', (item) => item.status],
    ];
    for (const [name, getter] of filters) {
      const value = params.get(name);
      if (value) items = items.filter((item) => String(getter(item)) === value);
    }
    return paginate(sortRows(items, params, 'updatedAt'), params);
  },

  async getAdmission(entityId, signal) {
    await wait(signal);
    const entity = admissionRow(required(state.admissions.find((item) => item.id === entityId)));
    return clone({
      admission: entity,
      history: state.history.filter(
        (event) => event.entityType === 'ADMISSION' && event.entityId === entityId,
      ),
    });
  },

  async saveAdmission(input, entityId) {
    await wait(undefined, 400);
    program(input.programId);
    source(input.sourceId);
    if (!Number.isInteger(input.year)) throw new Error('سال پذیرش الزامی است.');
    const timestamp = now();
    if (entityId) {
      const entity = required(state.admissions.find((item) => item.id === entityId));
      Object.assign(entity, input, { updatedAt: timestamp });
      addHistory('ADMISSION', entityId, 'رکورد پذیرش ویرایش شد');
      return clone(entity);
    }
    const entity: Admission = {
      id: id('admission'),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };
    state.admissions.unshift(entity);
    addHistory('ADMISSION', entity.id, 'رکورد پذیرش افزوده شد');
    return clone(entity);
  },

  async archiveAdmission(entityId) {
    await wait(undefined, 320);
    const entity = required(state.admissions.find((item) => item.id === entityId));
    entity.status = 'ARCHIVED';
    entity.updatedAt = now();
    addHistory('ADMISSION', entityId, 'رکورد پذیرش آرشیو شد');
  },

  async listSources(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.sources
      .map(sourceRow)
      .filter((item) => includesSearch([item.title, item.filename], params.get('search')));
    for (const field of ['type', 'status', 'examGroup'] as const) {
      const value = params.get(field);
      if (value) items = items.filter((item) => item[field] === value);
    }
    return paginate(sortRows(items, params, 'updatedAt'), params);
  },

  async getSource(entityId, signal) {
    await wait(signal);
    const entity = source(entityId);
    return clone({
      source: sourceRow(entity),
      imports: state.imports.filter((item) => item.sourceId === entityId),
      universities: state.universities.filter((item) => item.sourceIds.includes(entityId)),
      majors: state.majors.filter((item) => item.sourceIds.includes(entityId)),
      programs: state.programs.filter((item) => item.sourceIds.includes(entityId)),
      admissions: state.admissions.filter((item) => item.sourceId === entityId),
      history: state.history.filter(
        (event) => event.entityType === 'SOURCE' && event.entityId === entityId,
      ),
    });
  },

  async saveSource(input, entityId) {
    await wait(undefined, 380);
    if (!input.title.trim()) throw new Error('عنوان و نوع منبع الزامی است.');
    const timestamp = now();
    if (entityId) {
      const entity = source(entityId);
      Object.assign(entity, input, { updatedAt: timestamp });
      addHistory('SOURCE', entityId, 'منبع ویرایش شد');
      return clone(entity);
    }
    const entity: Source = {
      id: id('source'),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...input,
    };
    state.sources.unshift(entity);
    addHistory('SOURCE', entity.id, 'منبع افزوده شد');
    return clone(entity);
  },

  async archiveSource(entityId) {
    await wait(undefined, 320);
    const entity = source(entityId);
    entity.status = 'ARCHIVED';
    entity.updatedAt = now();
    addHistory('SOURCE', entityId, 'منبع آرشیو شد');
  },

  async listImports(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.imports.filter((item) => {
      const linkedSource = source(item.sourceId);
      return includesSearch(
        [item.id, linkedSource.title, linkedSource.filename],
        params.get('search'),
      );
    });
    const status = params.get('status');
    if (status) items = items.filter((item) => item.status === status);
    const sourceId = params.get('source');
    if (sourceId) items = items.filter((item) => item.sourceId === sourceId);
    return paginate(sortRows(items, params, 'startedAt'), params);
  },

  async getImport(entityId, signal) {
    await wait(signal);
    const importJob = required(state.imports.find((item) => item.id === entityId));
    return clone({
      importJob,
      source: source(importJob.sourceId),
      rawRecords: state.rawRecords.filter((item) => item.importId === entityId),
      issues: state.issues.filter((issue) => issue.importId === entityId),
      history: state.history.filter(
        (event) => event.entityType === 'IMPORT' && event.entityId === entityId,
      ),
    });
  },

  async runImportAction(entityId, action: ImportAction) {
    await wait(undefined, 480);
    const job = required(state.imports.find((item) => item.id === entityId));
    const transitions: Partial<Record<ImportAction, ImportJob['status'][]>> = {
      START: ['PENDING'],
      VALIDATE: ['PARSING'],
      PREPARE_COMMIT: ['VALIDATING', 'REVIEW_REQUIRED'],
      COMMIT: ['READY_TO_COMMIT'],
      RETRY: ['FAILED'],
    };
    if (!transitions[action]?.includes(job.status))
      throw new Error('این اقدام در وضعیت فعلی Import مجاز نیست.');
    if (action === 'START') job.status = 'PARSING';
    if (action === 'VALIDATE') {
      job.status = 'VALIDATING';
      job.stages = [
        ...new Set<ImportJob['stages'][number]>([...job.stages, 'PARSED', 'NORMALIZED']),
      ];
      job.metrics.parsed = Math.max(job.metrics.parsed, job.metrics.raw - job.metrics.rejected);
    }
    if (action === 'PREPARE_COMMIT') {
      job.stages = [
        ...new Set<ImportJob['stages'][number]>([...job.stages, 'VALIDATED', 'DEDUPLICATED']),
      ];
      job.status =
        job.status === 'VALIDATING' && job.metrics.rejected > 0
          ? 'REVIEW_REQUIRED'
          : 'READY_TO_COMMIT';
      if (job.status === 'READY_TO_COMMIT')
        job.stages = [...new Set<ImportJob['stages'][number]>([...job.stages, 'REVIEWED'])];
    }
    if (action === 'COMMIT') {
      job.status = 'COMMITTED';
      job.stages = [...new Set<ImportJob['stages'][number]>([...job.stages, 'COMMITTED'])];
      job.metrics.committed = job.metrics.valid;
      job.completedAt = now();
      addHistory('IMPORT', entityId, 'Import ثبت نهایی شد');
    }
    if (action === 'RETRY') {
      job.status = 'PENDING';
      job.stages = ['REGISTERED'];
      job.errorMessage = undefined;
      job.completedAt = undefined;
      addHistory('IMPORT', entityId, 'تلاش مجدد Import آغاز شد');
    }
    return clone(job);
  },

  async listQualityIssues(params, signal) {
    await wait(signal);
    maybeMockError(params);
    let items = state.issues.filter((item) =>
      includesSearch([item.title, item.description, item.type], params.get('search')),
    );
    for (const field of [
      'type',
      'severity',
      'status',
      'entityType',
      'sourceId',
      'importId',
    ] as const) {
      const value = params.get(field);
      if (value) items = items.filter((item) => item[field] === value);
    }
    return paginate(sortRows(items, params, 'detectedAt'), params);
  },

  async getQualityIssue(entityId, signal) {
    await wait(signal);
    return clone(required(state.issues.find((item) => item.id === entityId)));
  },

  async resolveQualityIssue(entityId, resolution: QualityResolution) {
    await wait(undefined, 450);
    const issue = required(state.issues.find((item) => item.id === entityId));
    if (issue.status !== 'OPEN') throw new Error('این مسئله قبلاً بسته شده است.');
    if (!resolution.note.trim()) throw new Error('توضیح تصمیم الزامی است.');
    if (resolution.action === 'IGNORE') {
      issue.status = 'IGNORED';
      issue.resolvedAt = now();
      issue.resolutionNote = resolution.note;
      addHistory(
        issue.entityType,
        issue.entityId ?? issue.rawRecordId ?? issue.id,
        'مشکل داده نادیده گرفته شد',
        resolution.note,
      );
      return clone(issue);
    }
    if (issue.type === 'DUPLICATE_UNIVERSITY' && resolution.action === 'MERGE_UNIVERSITY') {
      const sourceUniversity = university(required(issue.entityId));
      const target = university(resolution.targetUniversityId);
      if (sourceUniversity.id === target.id)
        throw new Error('رکورد مقصد باید با رکورد مبدا متفاوت باشد.');
      state.programs.forEach((item) => {
        if (item.universityId === sourceUniversity.id) item.universityId = target.id;
      });
      target.aliases = [
        ...new Set([...target.aliases, sourceUniversity.nameFa, ...sourceUniversity.aliases]),
      ];
      target.sourceIds = [...new Set([...target.sourceIds, ...sourceUniversity.sourceIds])];
      target.updatedAt = now();
      sourceUniversity.status = 'ARCHIVED';
      sourceUniversity.updatedAt = now();
      addHistory('UNIVERSITY', target.id, 'رکورد تکراری ادغام شد', resolution.note);
      return clone(setIssueResolved(issue, resolution.note));
    }
    if (issue.type === 'UNMAPPED_MAJOR' && resolution.action === 'MAP_MAJOR') {
      const raw = required(state.rawRecords.find((item) => item.id === issue.rawRecordId));
      major(resolution.majorId);
      raw.matchedMajorId = resolution.majorId;
      raw.validationState = raw.matchedUniversityId ? 'VALID' : 'WARNING';
      raw.errors = raw.errors.filter((error) => !error.includes('نگاشت'));
      addHistory('MAJOR', resolution.majorId, 'رشته نگاشت شد', resolution.note);
      return clone(setIssueResolved(issue, resolution.note));
    }
    if (issue.type === 'MISSING_UNIVERSITY_LOCATION' && resolution.action === 'SET_LOCATION') {
      const entity = university(required(issue.entityId));
      entity.province = resolution.province;
      entity.city = resolution.city;
      entity.updatedAt = now();
      addHistory('UNIVERSITY', entity.id, 'موقعیت دانشگاه تکمیل شد', resolution.note);
      return clone(setIssueResolved(issue, resolution.note));
    }
    if (issue.type === 'INVALID_ADMISSION_CODE' && resolution.action === 'SET_ADMISSION_CODE') {
      const entity = required(state.admissions.find((item) => item.id === issue.entityId));
      entity.admissionCode = resolution.admissionCode;
      entity.updatedAt = now();
      addHistory('ADMISSION', entity.id, 'کد پذیرش اصلاح شد', resolution.note);
      return clone(setIssueResolved(issue, resolution.note));
    }
    if (issue.type === 'UNKNOWN_DEGREE_LEVEL' && resolution.action === 'SET_DEGREE_LEVEL') {
      const entity = program(required(issue.entityId));
      entity.degreeLevel = resolution.degreeLevel;
      entity.titleFa = titleForProgram(entity.universityId, entity.majorId, resolution.degreeLevel);
      entity.updatedAt = now();
      addHistory('PROGRAM', entity.id, 'مقطع برنامه اصلاح شد', resolution.note);
      return clone(setIssueResolved(issue, resolution.note));
    }
    throw new Error('راه‌حل انتخاب‌شده با نوع مسئله سازگار نیست.');
  },

  async listUniversityOptions() {
    await wait();
    return clone(state.universities.filter((item) => item.status !== 'ARCHIVED'));
  },
  async listMajorOptions() {
    await wait();
    return clone(state.majors.filter((item) => item.status !== 'ARCHIVED'));
  },
  async listProgramOptions() {
    await wait();
    return clone(state.programs.filter((item) => item.status !== 'ARCHIVED').map(programRow));
  },
  async listSourceOptions() {
    await wait();
    return clone(state.sources.filter((item) => item.status !== 'ARCHIVED'));
  },
};

export function validateMockGraph() {
  const universityIds = new Set(state.universities.map((item) => item.id));
  const majorIds = new Set(state.majors.map((item) => item.id));
  const programIds = new Set(state.programs.map((item) => item.id));
  const admissionIds = new Set(state.admissions.map((item) => item.id));
  const sourceIds = new Set(state.sources.map((item) => item.id));
  const importIds = new Set(state.imports.map((item) => item.id));
  const rawRecordIds = new Set(state.rawRecords.map((item) => item.id));
  const entityIds = {
    UNIVERSITY: universityIds,
    MAJOR: majorIds,
    PROGRAM: programIds,
    ADMISSION: admissionIds,
    IMPORT: importIds,
    RAW_RECORD: rawRecordIds,
  };
  const historyEntityIds: Record<DataHistoryEvent['entityType'], Set<string>> = {
    ...entityIds,
    SOURCE: sourceIds,
  };
  return {
    catalogsValid:
      state.universities.every((item) => item.sourceIds.every((id) => sourceIds.has(id))) &&
      state.majors.every((item) => item.sourceIds.every((id) => sourceIds.has(id))),
    programsValid: state.programs.every(
      (item) =>
        universityIds.has(item.universityId) &&
        majorIds.has(item.majorId) &&
        item.sourceIds.every((sourceId) => sourceIds.has(sourceId)),
    ),
    admissionsValid: state.admissions.every(
      (item) => programIds.has(item.programId) && sourceIds.has(item.sourceId),
    ),
    importsValid:
      state.imports.every((item) => sourceIds.has(item.sourceId)) &&
      state.rawRecords.every(
        (item) =>
          importIds.has(item.importId) &&
          (!item.matchedUniversityId || universityIds.has(item.matchedUniversityId)) &&
          (!item.matchedMajorId || majorIds.has(item.matchedMajorId)),
      ),
    issuesValid: state.issues.every(
      (issue) =>
        (!issue.sourceId || sourceIds.has(issue.sourceId)) &&
        (!issue.importId || importIds.has(issue.importId)) &&
        (!issue.rawRecordId || rawRecordIds.has(issue.rawRecordId)) &&
        (!issue.entityId || entityIds[issue.entityType].has(issue.entityId)),
    ),
    historyValid: state.history.every((event) =>
      historyEntityIds[event.entityType].has(event.entityId),
    ),
    counts: {
      universities: state.universities.length,
      majors: state.majors.length,
      programs: state.programs.length,
      admissions: state.admissions.length,
      sources: state.sources.length,
      imports: state.imports.length,
      issues: state.issues.length,
    },
  };
}
