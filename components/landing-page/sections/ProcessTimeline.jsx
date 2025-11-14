import React from "react";

const steps = [
  {
    title: "ارزیابی اولیه و هدف‌گذاری",
    description:
      "با چند پرسش سریع، اهداف، محدودیت‌ها و علاقه‌مندی‌های شما مشخص می‌شود و نقشه راه شخصی‌سازی‌شده‌ای دریافت می‌کنید.",
  },
  {
    title: "ساخت پرونده اپلای",
    description:
      "رزومه، توصیه‌نامه‌ها، نمونه کار و انگیزه‌نامه با کمک هوش مصنوعی و بازخورد مربیان به نسخه نهایی می‌رسند.",
  },
  {
    title: "ارسال و پیگیری",
    description:
      "وااند ارسال مدارک، پرداخت هزینه‌ها و مکاتبه با دانشگاه‌ها را مدیریت می‌کند و وضعیت هر پرونده را به‌روز نگه می‌دارد.",
  },
  {
    title: "آمادگی پذیرش و ویزا",
    description:
      "بعد از دریافت پذیرش، راهنمای کامل اقدام برای ویزا، خوابگاه و تطبیق فرهنگی را در پنل خود دنبال می‌کنید.",
  },
];

function ProcessTimeline() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-0 flex justify-center">
        <div className="h-full w-[2px] bg-gradient-to-b from-blue-200 via-transparent to-blue-200" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-blue-600">مسیر شفاف</p>
          <h2 className="text-3xl font-black leading-[1.6] md:text-5xl">
            چهار مرحله تا آغاز تحصیل در دانشگاه رؤیایی
          </h2>
        </div>
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl md:flex-row md:items-start"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg">
                {index + 1}
              </div>
              <div className="text-right md:text-right">
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600 md:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProcessTimeline;
