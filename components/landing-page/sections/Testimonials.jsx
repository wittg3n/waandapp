import React from "react";

const testimonials = [
  {
    name: "مائده صادقی",
    role: "دانشجوی کارشناسی ارشد علوم داده، دانشگاه لوزان",
    quote:
      "اگر وااند نبود هنوز درگیر نگارش انگیزه‌نامه بودم. پیشنهادهای دقیق دانشگاه و تمرین‌های مصاحبه باعث شد با اعتمادبه‌نفس پذیرش بگیرم.",
    initials: "م ص",
  },
  {
    name: "سینا کیانی",
    role: "دانشجوی دکتری مهندسی برق، دانشگاه ملی سنگاپور",
    quote:
      "مربی هوشمند همیشه آماده بود و هر بار رزومه را با بازخورد استادان هماهنگ می‌کرد. تجربه‌ای که هیچ مؤسسه سنتی ارائه نمی‌دهد.",
    initials: "س ک",
  },
  {
    name: "هلیا زمانی",
    role: "کارآموز تحقیقاتی، مرکز هوش مصنوعی تورنتو",
    quote:
      "از تطبیق فرهنگی تا پیدا کردن خوابگاه، داشبورد وااند با اطلاعات لحظه‌ای کمک کرد بدون استرس وارد کشور جدید شوم.",
    initials: "ه ز",
  },
];

function Testimonials() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-[48px] bg-gradient-to-t from-blue-100 via-white to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-blue-600">تجربه واقعی</p>
          <h2 className="text-3xl font-black leading-[1.6] md:text-5xl">
            دانشجویانی که با وااند رؤیای خود را زندگی می‌کنند
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col justify-between rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl"
            >
              <blockquote className="text-sm leading-7 text-gray-600 md:text-base">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-end gap-3 text-right">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 md:text-sm">{testimonial.role}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow-lg">
                  {testimonial.initials}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
