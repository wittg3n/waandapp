import React from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "پلن رشد",
    price: "۳/۹ میلیون تومان",
    description: "برای دانشجویانی که می‌خواهند با راهنمایی هوشمند مدارک خود را تکمیل کنند.",
    features: [
      "تحلیل پروفایل و پیشنهاد دانشگاه",
      "بازنویسی رزومه و انگیزه‌نامه",
      "دسترسی به چت‌بات تخصصی",
      "۳۰ روز پشتیبانی مربی",
    ],
    highlighted: false,
  },
  {
    name: "پلن موفقیت",
    price: "۷/۵ میلیون تومان",
    description: "برای داوطلبانی که نیاز به همراهی کامل تا لحظه دریافت ویزا دارند.",
    features: [
      "همه امکانات پلن رشد",
      "آماده‌سازی مصاحبه و مکاتبه با اساتید",
      "پیگیری ارسال مدارک و اطلاع‌رسانی لحظه‌ای",
      "راهنمای جامع ویزا و اسکان",
    ],
    highlighted: true,
  },
];

function PricingPlans() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-0 mx-auto max-w-6xl rounded-[56px] bg-gradient-to-r from-blue-100 via-white to-cyan-100" />
      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-blue-600">پلن‌های منعطف</p>
          <h2 className="text-3xl font-black leading-[1.6] md:text-5xl">
            متناسب با مسیر و بودجه خود انتخاب کنید
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
            تمام پلن‌ها شامل دسترسی به داشبورد هوشمند، به‌روزرسانی‌های لحظه‌ای و گزارش پیشرفت هفتگی هستند.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
                plan.highlighted ? "ring-2 ring-blue-500 md:-translate-y-3" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{plan.name}</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                    {plan.price}
                  </h3>
                </div>
                {plan.highlighted && (
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    محبوب‌ترین
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
                {plan.description}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-gray-700 md:text-base">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center justify-end gap-3">
                    <span>{feature}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Check className="h-4 w-4" />
                    </span>
                  </li>
                ))}
              </ul>
              <button className="mt-10 w-full rounded-full bg-gray-900 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-gray-800">
                شروع همکاری با وااند
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingPlans;
