import React from "react";
import { LineShadowText } from "../../ui/line-shadow-text";

const stats = [
  { label: "دانشجوی فعال", value: "۲۵۰۰+" },
  { label: "نامه انگیزشی تکمیل‌شده", value: "۴۸۰۰" },
  { label: "دانشگاه‌های پوشش داده‌شده", value: "۶۵" },
];

function ValueProposition() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-0 mx-auto max-w-6xl blur-3xl opacity-40 pointer-events-none">
        <div className="h-full w-full rounded-[40px] bg-gradient-to-r from-blue-200 via-cyan-200 to-purple-200" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col gap-16 md:flex-row md:items-center">
          <div className="md:w-1/2 space-y-6 text-right">
            <p className="text-sm font-medium text-blue-600">رویکرد ما</p>
            <h2 className="text-3xl font-black leading-[1.6] md:text-5xl">
              <span className="inline-flex items-center gap-3">
                <LineShadowText className="text-blue-700">همراه</LineShadowText>
                دیجیتال هوشمند شما
              </span>
              <br className="hidden md:block" />
              برای مسیر پیچیده اپلای
            </h2>
            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              وااند با ترکیب داده‌های جهانی، تجربه دانشجویان و مدل‌های هوش مصنوعی،
              هر مرحله از مسیر اپلای را برای شما شفاف، سریع و مطمئن می‌کند. از انتخاب
              مقصد تا مکاتبه با اساتید، یک تیم دیجیتال تمام‌وقت کنار شماست.
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/60 bg-white/70 p-6 text-center shadow-xl backdrop-blur-xl"
              >
                <p className="text-2xl font-extrabold text-blue-700 md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueProposition;
