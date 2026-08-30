export const pricingPlans = [
  {
    id: 'start',
    name: 'شروع',
    context: 'برای ساخت حساب و معرفی شرایط',
    price: 'شروع رایگان',
    note: 'محدوده این سطح پیش از عرضه نهایی می‌شود.',
    features: ['ساخت پروفایل اولیه', 'ثبت هدف و شرایط تحصیلی', 'آماده‌سازی اطلاعات برای تحلیل'],
    recommended: false,
  },
  {
    id: 'planning',
    name: 'برنامه‌ریزی',
    context: 'برای تحلیل و ساخت فهرست انتخاب‌ها',
    price: 'قیمت در حال نهایی‌سازی',
    note: 'مبلغ و سقف استفاده هنوز منتشر نشده است.',
    features: ['تحلیل مدارک و سوابق', 'پیشنهاد دانشگاه و برنامه', 'مقایسه و ساخت فهرست کوتاه'],
    recommended: true,
  },
  {
    id: 'management',
    name: 'مدیریت مسیر',
    context: 'برای پیگیری مدارک، ددلاین‌ها و درخواست‌ها',
    price: 'قیمت در حال نهایی‌سازی',
    note: 'جزئیات خدمات و محدودیت‌ها پس از تایید اعلام می‌شود.',
    features: ['مدیریت مدارک و مراحل', 'پیگیری ددلاین‌ها', 'نمای یکپارچه وضعیت درخواست‌ها'],
    recommended: false,
  },
] as const;

export const pricingComparison = [
  { feature: 'ساخت پروفایل اولیه', plans: [true, true, true] },
  { feature: 'تحلیل مدارک و سوابق', plans: [false, true, true] },
  { feature: 'پیشنهاد دانشگاه و برنامه', plans: [false, true, true] },
  { feature: 'مقایسه و فهرست کوتاه', plans: [false, true, true] },
  { feature: 'مدیریت مدارک و ددلاین‌ها', plans: [false, false, true] },
  { feature: 'پیگیری یکپارچه درخواست‌ها', plans: [false, false, true] },
] as const;
