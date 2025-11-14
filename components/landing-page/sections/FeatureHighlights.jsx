import React from "react";
import { Brain, FileText, MessagesSquare, Sparkles } from "lucide-react";

const features = [
  {
    title: "تحلیل عمیق پروفایل",
    description:
      "هوش مصنوعی پرونده تحصیلی، مهارت‌ها و علایق شما را تحلیل می‌کند و لیست دانشگاه‌های مناسب را پیشنهاد می‌دهد.",
    icon: Brain,
  },
  {
    title: "نگارش حرفه‌ای مدارک",
    description:
      "مدل‌های زبانی پیشرفته، رزومه و نامه انگیزشی شما را به زبان مقصد بازنویسی و با معیارهای دانشگاه هماهنگ می‌کنند.",
    icon: FileText,
  },
  {
    title: "مربی شخصی ۲۴/۷",
    description:
      "چت‌بات تخصصی وااند در تمام ساعات پاسخ‌گوی سوالات شما و ارائه‌کننده تمرین‌های آماده‌سازی مصاحبه است.",
    icon: MessagesSquare,
  },
  {
    title: "به‌روزرسانی لحظه‌ای",
    description:
      "تغییرات ددلاین‌ها، بورسیه‌های جدید و نیازمندی‌های مدارک را در داشبورد خود به صورت نوتیفیکیشن دریافت کنید.",
    icon: Sparkles,
  },
];

function FeatureHighlights() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-x-0 top-0 mx-auto h-[70%] max-w-5xl rounded-[48px] bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-inner" />
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-blue-600">پشتیبانی جامع</p>
          <h2 className="text-3xl font-black leading-[1.6] md:text-5xl">
            ابزارهایی که اپلای را از نو تعریف می‌کنند
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
            تمام سرویس‌ها در یک فضای یکپارچه، با طراحی دقیق برای دانشجویان ایرانی که می‌خواهند بدون سردرگمی به مقصد ایده‌آل خود برسند.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group rounded-3xl border border-white/60 bg-white/70 p-8 text-right shadow-xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureHighlights;
