import type { AdminSession, BackgroundJob, BlockedIp, FeatureFlag, LoginAttempt, SecurityEvent, ServiceHealth, SystemSettings } from '../types/system.types';

const checked = '2026-09-06T08:30:00.000Z';
export const healthSeed: ServiceHealth[] = [
  {id:'api',name:'API',status:'HEALTHY',latencyMs:42,uptimePercent:99.99,lastCheckedAt:checked}, {id:'mongodb',name:'MongoDB',status:'HEALTHY',latencyMs:18,uptimePercent:99.98,lastCheckedAt:checked}, {id:'redis',name:'Redis',status:'HEALTHY',latencyMs:4,uptimePercent:99.99,lastCheckedAt:checked}, {id:'email',name:'Email',status:'HEALTHY',latencyMs:126,uptimePercent:99.7,lastCheckedAt:checked}, {id:'sms',name:'SMS',status:'DEGRADED',latencyMs:820,uptimePercent:97.1,message:'افزایش زمان پاسخ سرویس پیامک',lastCheckedAt:checked}, {id:'blog',name:'Blog',status:'HEALTHY',latencyMs:71,uptimePercent:99.95,lastCheckedAt:checked}, {id:'job-runner',name:'Job Runner',status:'HEALTHY',latencyMs:25,uptimePercent:99.9,lastCheckedAt:checked},
];
const baseJob = { createdAt:'2026-09-05T08:00:00.000Z',triggeredByAdminId:'adm_001',maxAttempts:3 } as const;
export const jobsSeed: BackgroundJob[] = [
  {...baseJob,id:'job_001',type:'DATA_QUALITY_SCAN',title:'بررسی کیفیت داده‌های دانشگاهی',status:'SUCCEEDED',attempts:1,progress:100,startedAt:'2026-09-05T08:01:00.000Z',completedAt:'2026-09-05T08:06:00.000Z',relatedEntity:{type:'QUALITY',id:'issue-001',label:'کیفیت داده‌ها',href:'/data/quality'},payloadSummary:'بررسی رکوردهای دانشگاهی'},
  {...baseJob,id:'job_002',type:'SANJESH_IMPORT',title:'ورودی سنجش ۱۴۰۴ — ریاضی',status:'RUNNING',attempts:1,progress:68,startedAt:'2026-09-06T07:30:00.000Z',relatedEntity:{type:'IMPORT',id:'import-math-1404',label:'ورودی سنجش ۱۴۰۴',href:'/data/imports/import-math-1404'},payloadSummary:'پردازش داده گروه ریاضی'},
  {...baseJob,id:'job_003',type:'CONTENT_SCHEDULE_PUBLISH',title:'انتشار نوشته زمان‌بندی‌شده',status:'QUEUED',attempts:0,progress:0,relatedEntity:{type:'POST',id:'post-003',label:'نوشته زمان‌بندی‌شده',href:'/content/posts/post-003'},payloadSummary:'انتشار یک نوشته آماده'},
  {...baseJob,id:'job_004',type:'USER_EXPORT',title:'خروجی اطلاعات کاربر',status:'FAILED',attempts:3,errorMessage:'تولید فایل خروجی با خطا متوقف شد.',startedAt:'2026-09-05T09:00:00.000Z',completedAt:'2026-09-05T09:02:00.000Z',relatedEntity:{type:'USER',id:'000000000000000000000001',label:'کاربر واند',href:'/users/000000000000000000000001'},payloadSummary:'خروجی اطلاعات یک کاربر'},
  {...baseJob,id:'job_005',type:'NOTIFICATION_BROADCAST',title:'ارسال اعلان عمومی',status:'SUCCEEDED',attempts:1,progress:100,startedAt:'2026-09-04T10:00:00.000Z',completedAt:'2026-09-04T10:05:00.000Z',payloadSummary:'اعلان عمومی کاربران'},
  {...baseJob,id:'job_006',type:'DATA_QUALITY_SCAN',title:'اسکن رکوردهای بدون نگاشت',status:'FAILED',attempts:2,errorMessage:'بخشی از رکوردها قابل پردازش نبود.',startedAt:'2026-09-06T06:00:00.000Z',completedAt:'2026-09-06T06:03:00.000Z',relatedEntity:{type:'QUALITY',id:'issue-003',label:'رکوردهای بدون نگاشت',href:'/data/quality'},payloadSummary:'اسکن نگاشت رشته‌ها'},
];
export const sessionsSeed: AdminSession[] = [
  {id:'session_001',adminId:'adm_001',status:'ACTIVE',createdAt:'2026-09-06T05:00:00.000Z',lastActiveAt:'2026-09-06T08:25:00.000Z',expiresAt:'2026-09-06T17:00:00.000Z',browser:'Chrome 140',os:'Windows 11',deviceType:'DESKTOP',ipAddress:'192.0.2.10',isCurrent:true},
  {id:'session_002',adminId:'adm_002',status:'ACTIVE',createdAt:'2026-09-05T11:00:00.000Z',lastActiveAt:'2026-09-06T08:10:00.000Z',expiresAt:'2026-09-06T23:00:00.000Z',browser:'Safari 19',os:'macOS',deviceType:'DESKTOP',ipAddress:'192.0.2.21',isCurrent:false},
  {id:'session_003',adminId:'adm_003',status:'ACTIVE',createdAt:'2026-09-06T06:00:00.000Z',lastActiveAt:'2026-09-06T07:55:00.000Z',expiresAt:'2026-09-06T18:00:00.000Z',browser:'Chrome Mobile',os:'Android',deviceType:'MOBILE',ipAddress:'192.0.2.31',isCurrent:false},
  {id:'session_004',adminId:'adm_005',status:'EXPIRED',createdAt:'2026-09-04T05:00:00.000Z',lastActiveAt:'2026-09-04T12:00:00.000Z',expiresAt:'2026-09-04T17:00:00.000Z',browser:'Firefox',os:'Linux',deviceType:'DESKTOP',ipAddress:'192.0.2.41',isCurrent:false},
];
const reasons = ['SUCCESS','INVALID_CREDENTIALS','MFA_FAILED','RATE_LIMITED','SUCCESS','ACCOUNT_SUSPENDED'] as const;
export const loginAttemptsSeed: LoginAttempt[] = Array.from({length:18},(_,index)=>({id:`login_${String(index+1).padStart(3,'0')}`,email:index%4===0?'unknown@example.com':`admin${(index%8)+1}@waand.com`,successful:reasons[index%reasons.length]==='SUCCESS',reason:reasons[index%reasons.length],ipAddress:`192.0.2.${50+index}`,browser:index%2?'Chrome':'Firefox',createdAt:`2026-09-${index<12?'06':'05'}T${String(8-(index%8)).padStart(2,'0')}:20:00.000Z`}));
export const securityEventsSeed: SecurityEvent[] = [
  {id:'sec_001',type:'NEW_ADMIN_DEVICE',severity:'INFO',status:'OPEN',adminId:'adm_002',ipAddress:'192.0.2.21',titleFa:'دستگاه جدید ادمین',descriptionFa:'ورود از یک دستگاه جدید ثبت شد.',detectedAt:'2026-09-06T08:00:00.000Z'},
  {id:'sec_002',type:'REPEATED_FAILED_LOGIN',severity:'WARNING',status:'OPEN',ipAddress:'198.51.100.83',titleFa:'تلاش ورود ناموفق تکرارشونده',descriptionFa:'چند تلاش ناموفق از یک نشانی ثبت شد.',detectedAt:'2026-09-06T07:30:00.000Z'},
  {id:'sec_003',type:'SUSPICIOUS_LOGIN',severity:'CRITICAL',status:'ACKNOWLEDGED',adminId:'adm_003',ipAddress:'203.0.113.88',titleFa:'ورود مشکوک',descriptionFa:'الگوی ورود نیازمند بررسی شناسایی شد.',detectedAt:'2026-09-06T06:45:00.000Z',acknowledgedAt:'2026-09-06T07:00:00.000Z'},
  {id:'sec_004',type:'MFA_DISABLED',severity:'WARNING',status:'RESOLVED',adminId:'adm_006',titleFa:'احراز دومرحله‌ای غیرفعال',descriptionFa:'وضعیت MFA ادمین بررسی و ثبت شد.',detectedAt:'2026-09-05T12:00:00.000Z',resolvedAt:'2026-09-05T13:00:00.000Z'},
  {id:'sec_005',type:'SESSION_REVOKED',severity:'INFO',status:'RESOLVED',adminId:'adm_004',titleFa:'نشست مدیریتی لغو شد',descriptionFa:'نشست قدیمی ادمین با موفقیت لغو شد.',detectedAt:'2026-09-04T10:00:00.000Z',resolvedAt:'2026-09-04T10:01:00.000Z'},
];
export const blockedIpsSeed: BlockedIp[] = [
  {id:'ip_001',ipAddress:'203.0.113.42',reason:'تلاش ورود ناموفق تکرارشونده',status:'ACTIVE',createdAt:'2026-09-05T09:00:00.000Z',expiresAt:'2026-09-12T09:00:00.000Z',createdByAdminId:'adm_001'},
  {id:'ip_002',ipAddress:'198.51.100.17',reason:'الگوی درخواست مشکوک',status:'EXPIRED',createdAt:'2026-08-20T09:00:00.000Z',expiresAt:'2026-08-27T09:00:00.000Z',createdByAdminId:'adm_002'},
];
const timestamp='2026-08-01T08:00:00.000Z';
export const featureFlagsSeed: FeatureFlag[] = [
  {id:'flag_001',key:'career_recommendation_v2',nameFa:'پیشنهاد مسیر تحصیلی نسخه ۲',descriptionFa:'نسخه جدید پیشنهاد مسیر تحصیلی',enabled:true,rollout:{strategy:'ALL'},owner:'PRODUCT',createdAt:timestamp,updatedAt:'2026-09-01T08:00:00.000Z',updatedByAdminId:'adm_001'},
  {id:'flag_002',key:'new_onboarding',nameFa:'آن‌بوردینگ جدید',descriptionFa:'تجربه جدید شروع کار کاربران',enabled:false,rollout:{strategy:'ALL'},owner:'PRODUCT',createdAt:timestamp,updatedAt:'2026-08-28T08:00:00.000Z',updatedByAdminId:'adm_002'},
  {id:'flag_003',key:'ai_assistant',nameFa:'دستیار هوشمند',descriptionFa:'دستیار هوشمند مسیر تحصیلی',enabled:true,rollout:{strategy:'PERCENTAGE',percentage:20},owner:'PRODUCT',createdAt:timestamp,updatedAt:'2026-09-03T08:00:00.000Z',updatedByAdminId:'adm_001'},
  {id:'flag_004',key:'new_search_engine',nameFa:'موتور جستجوی جدید',descriptionFa:'نسخه جدید موتور جستجوی برنامه‌ها',enabled:true,rollout:{strategy:'ADMINS_ONLY'},owner:'PLATFORM',createdAt:timestamp,updatedAt:'2026-09-04T08:00:00.000Z',updatedByAdminId:'adm_002'},
];
export const settingsSeed: SystemSettings = {
  GENERAL:{productName:'Waand',defaultLocale:'fa-IR',timezone:'Asia/Tehran',supportEmail:'support@waand.com'},
  AUTHENTICATION:{adminMfaRequired:true,adminSessionHours:12,userSessionDays:30,maxLoginAttempts:5,lockoutMinutes:15},
  EMAIL:{enabled:true,senderName:'Waand',senderEmail:'noreply@waand.com',replyToEmail:'support@waand.com'},
  SMS:{enabled:true,otpEnabled:true,notificationSmsEnabled:false},
  SEO:{siteName:'Waand',defaultTitle:'واند | مسیر تحصیلی هوشمند',defaultDescription:'واند برای مدیریت و برنامه‌ریزی مسیر تحصیلی و انتخاب آگاهانه دانشگاه و رشته.',allowIndexing:true},
  BLOG:{postsPerPage:12,commentsEnabled:true,guestCommentsEnabled:false,commentsRequireModeration:true},
  MAINTENANCE:{enabled:false,message:'در حال انجام به‌روزرسانی هستیم. لطفاً چند دقیقه دیگر دوباره تلاش کنید.',allowAdminAccess:true},
};
