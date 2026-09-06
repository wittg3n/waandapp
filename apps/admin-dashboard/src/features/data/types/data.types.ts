export type EntityId = string;
export type CatalogStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type UniversityStatus = CatalogStatus;
export type MajorStatus = CatalogStatus;
export type ProgramStatus = CatalogStatus;
export type AdmissionStatus = CatalogStatus;
export type UniversityType = 'PUBLIC' | 'PRIVATE' | 'OTHER';
export type DegreeLevel =
  'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'PHD' | 'INTEGRATED' | 'OTHER' | 'UNKNOWN';
export type ExamGroup = 'MATH' | 'EXPERIMENTAL' | 'HUMANITIES' | 'ART' | 'LANGUAGE' | 'OTHER';

export interface University {
  id: EntityId;
  nameFa: string;
  nameEn?: string;
  aliases: string[];
  countryCode: string;
  province?: string;
  city?: string;
  type: UniversityType;
  website?: string;
  status: UniversityStatus;
  sourceIds: EntityId[];
  createdAt: string;
  updatedAt: string;
}

export interface Major {
  id: EntityId;
  nameFa: string;
  nameEn?: string;
  aliases: string[];
  status: MajorStatus;
  sourceIds: EntityId[];
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: EntityId;
  universityId: EntityId;
  majorId: EntityId;
  degreeLevel: DegreeLevel;
  titleFa: string;
  status: ProgramStatus;
  sourceIds: EntityId[];
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: EntityId;
  programId: EntityId;
  sourceId: EntityId;
  year: number;
  examGroup?: ExamGroup;
  admissionCode?: string;
  capacity?: number;
  admissionType?: string;
  status: AdmissionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SourceType = 'SANJESH_PDF' | 'OFFICIAL_WEBSITE' | 'MANUAL';
export type SourceStatus = 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export interface Source {
  id: EntityId;
  type: SourceType;
  title: string;
  year?: number;
  examGroup?: ExamGroup;
  filename?: string;
  sourceUrl?: string;
  status: SourceStatus;
  createdAt: string;
  updatedAt: string;
}

export type ImportStatus =
  | 'PENDING'
  | 'PARSING'
  | 'VALIDATING'
  | 'REVIEW_REQUIRED'
  | 'READY_TO_COMMIT'
  | 'COMMITTED'
  | 'FAILED';
export type ImportStage =
  'REGISTERED' | 'PARSED' | 'NORMALIZED' | 'VALIDATED' | 'DEDUPLICATED' | 'REVIEWED' | 'COMMITTED';
export type ImportAction = 'START' | 'VALIDATE' | 'PREPARE_COMMIT' | 'COMMIT' | 'RETRY';

export interface ImportMetrics {
  raw: number;
  parsed: number;
  valid: number;
  rejected: number;
  duplicates: number;
  committed: number;
}

export interface ImportJob {
  id: EntityId;
  sourceId: EntityId;
  status: ImportStatus;
  stages: ImportStage[];
  metrics: ImportMetrics;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export type ValidationState = 'VALID' | 'WARNING' | 'INVALID';

export interface RawImportRecord {
  id: EntityId;
  importId: EntityId;
  rowNumber: number;
  rawUniversityName: string;
  rawMajorName: string;
  rawAdmissionCode?: string;
  matchedUniversityId?: EntityId;
  matchedMajorId?: EntityId;
  validationState: ValidationState;
  errors: string[];
}

export type QualityIssueType =
  | 'DUPLICATE_UNIVERSITY'
  | 'MISSING_UNIVERSITY_LOCATION'
  | 'UNMAPPED_MAJOR'
  | 'INVALID_ADMISSION_CODE'
  | 'UNKNOWN_DEGREE_LEVEL'
  | 'ORPHAN_PROGRAM'
  | 'MISSING_SOURCE';
export type QualitySeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type QualityStatus = 'OPEN' | 'RESOLVED' | 'IGNORED';
export type QualityEntityType =
  'UNIVERSITY' | 'MAJOR' | 'PROGRAM' | 'ADMISSION' | 'IMPORT' | 'RAW_RECORD';

export interface DataQualityIssue {
  id: EntityId;
  type: QualityIssueType;
  severity: QualitySeverity;
  status: QualityStatus;
  entityType: QualityEntityType;
  entityId?: EntityId;
  importId?: EntityId;
  rawRecordId?: EntityId;
  sourceId?: EntityId;
  title: string;
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface DataHistoryEvent {
  id: EntityId;
  entityType: QualityEntityType | 'SOURCE';
  entityId: EntityId;
  title: string;
  description?: string;
  createdAt: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface UniversityRow extends University {
  programCount: number;
  issueCount: number;
}
export interface MajorRow extends Major {
  programCount: number;
  universityCount: number;
  issueCount: number;
}
export interface ProgramRow extends Program {
  university: University;
  major: Major;
  admissionCount: number;
  activeAdmissionCount: number;
  issueCount: number;
}
export interface AdmissionRow extends Admission {
  program: Program;
  university: University;
  major: Major;
  source: Source;
}
export interface SourceRow extends Source {
  relatedRecordCount: number;
  latestImport?: ImportJob;
}
export interface ImportDetail {
  importJob: ImportJob;
  source: Source;
  rawRecords: RawImportRecord[];
  issues: DataQualityIssue[];
  history: DataHistoryEvent[];
}
export interface UniversityDetail {
  university: University;
  programs: ProgramRow[];
  sources: Source[];
  issues: DataQualityIssue[];
  history: DataHistoryEvent[];
}
export interface MajorDetail {
  major: Major;
  programs: ProgramRow[];
  universities: University[];
  sources: Source[];
  issues: DataQualityIssue[];
  history: DataHistoryEvent[];
}
export interface ProgramDetail {
  program: ProgramRow;
  admissions: AdmissionRow[];
  sources: Source[];
  issues: DataQualityIssue[];
  history: DataHistoryEvent[];
}
export interface AdmissionDetail {
  admission: AdmissionRow;
  history: DataHistoryEvent[];
}
export interface SourceDetail {
  source: SourceRow;
  imports: ImportJob[];
  universities: University[];
  majors: Major[];
  programs: Program[];
  admissions: Admission[];
  history: DataHistoryEvent[];
}

export type UniversityInput = Pick<University, 'nameFa' | 'countryCode' | 'type' | 'status'> &
  Partial<Pick<University, 'nameEn' | 'aliases' | 'province' | 'city' | 'website' | 'sourceIds'>>;
export type MajorInput = Pick<Major, 'nameFa' | 'status'> &
  Partial<Pick<Major, 'nameEn' | 'aliases' | 'sourceIds'>>;
export type ProgramInput = Pick<Program, 'universityId' | 'majorId' | 'degreeLevel' | 'status'> &
  Partial<Pick<Program, 'titleFa' | 'sourceIds'>>;
export type AdmissionInput = Pick<Admission, 'programId' | 'sourceId' | 'year' | 'status'> &
  Partial<Pick<Admission, 'examGroup' | 'admissionCode' | 'capacity' | 'admissionType' | 'notes'>>;
export type SourceInput = Pick<Source, 'title' | 'type' | 'status'> &
  Partial<Pick<Source, 'year' | 'examGroup' | 'filename' | 'sourceUrl'>>;

export type QualityResolution =
  | { action: 'MERGE_UNIVERSITY'; targetUniversityId: EntityId; note: string }
  | { action: 'MAP_MAJOR'; majorId: EntityId; note: string }
  | { action: 'SET_LOCATION'; province: string; city: string; note: string }
  | { action: 'SET_ADMISSION_CODE'; admissionCode: string; note: string }
  | { action: 'SET_DEGREE_LEVEL'; degreeLevel: Exclude<DegreeLevel, 'UNKNOWN'>; note: string }
  | { action: 'IGNORE'; note: string };

export interface DataRepository {
  listUniversities(
    params: URLSearchParams,
    signal?: AbortSignal,
  ): Promise<PageResult<UniversityRow>>;
  getUniversity(id: EntityId, signal?: AbortSignal): Promise<UniversityDetail>;
  saveUniversity(input: UniversityInput, id?: EntityId): Promise<University>;
  archiveUniversity(id: EntityId): Promise<void>;
  listMajors(params: URLSearchParams, signal?: AbortSignal): Promise<PageResult<MajorRow>>;
  getMajor(id: EntityId, signal?: AbortSignal): Promise<MajorDetail>;
  saveMajor(input: MajorInput, id?: EntityId): Promise<Major>;
  archiveMajor(id: EntityId): Promise<void>;
  listPrograms(params: URLSearchParams, signal?: AbortSignal): Promise<PageResult<ProgramRow>>;
  getProgram(id: EntityId, signal?: AbortSignal): Promise<ProgramDetail>;
  saveProgram(input: ProgramInput, id?: EntityId): Promise<Program>;
  archiveProgram(id: EntityId): Promise<void>;
  listAdmissions(params: URLSearchParams, signal?: AbortSignal): Promise<PageResult<AdmissionRow>>;
  getAdmission(id: EntityId, signal?: AbortSignal): Promise<AdmissionDetail>;
  saveAdmission(input: AdmissionInput, id?: EntityId): Promise<Admission>;
  archiveAdmission(id: EntityId): Promise<void>;
  listSources(params: URLSearchParams, signal?: AbortSignal): Promise<PageResult<SourceRow>>;
  getSource(id: EntityId, signal?: AbortSignal): Promise<SourceDetail>;
  saveSource(input: SourceInput, id?: EntityId): Promise<Source>;
  archiveSource(id: EntityId): Promise<void>;
  listImports(params: URLSearchParams, signal?: AbortSignal): Promise<PageResult<ImportJob>>;
  getImport(id: EntityId, signal?: AbortSignal): Promise<ImportDetail>;
  runImportAction(id: EntityId, action: ImportAction): Promise<ImportJob>;
  listQualityIssues(
    params: URLSearchParams,
    signal?: AbortSignal,
  ): Promise<PageResult<DataQualityIssue>>;
  getQualityIssue(id: EntityId, signal?: AbortSignal): Promise<DataQualityIssue>;
  resolveQualityIssue(id: EntityId, resolution: QualityResolution): Promise<DataQualityIssue>;
  listUniversityOptions(): Promise<University[]>;
  listMajorOptions(): Promise<Major[]>;
  listProgramOptions(): Promise<ProgramRow[]>;
  listSourceOptions(): Promise<Source[]>;
}
