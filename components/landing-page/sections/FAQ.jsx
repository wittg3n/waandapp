import React from "react";

const faqs = [
  {
    question: "چطور می‌توانم از وااند استفاده کنم؟",
    answer:
      "کافی است ثبت‌نام کنید، اطلاعات اولیه تحصیلی خود را وارد نمایید و دانشگاه‌های هدف را مشخص کنید. بلافاصله به داشبورد هوشمند و مربی مجازی دسترسی خواهید داشت.",
  },
  {
    question: "آیا وااند جایگزین مشاور انسانی است؟",
    answer:
      "ما ترکیبی از فناوری و تجربه انسانی ارائه می‌دهیم. هوش مصنوعی فرآیندها را تسریع می‌کند و مربیان متخصص در لحظات کلیدی بازخورد شخصی ارائه می‌دهند.",
  },
  {
    question: "چگونه پرداخت انجام می‌شود؟",
    answer:
      "پس از انتخاب پلن مناسب، امکان پرداخت آنلاین و قسط‌بندی وجود دارد. برای تیم‌های دانشگاهی نیز قرارداد سازمانی ارائه می‌شود.",
  },
  {
    question: "اگر پذیرش نگیرم چه اتفاقی می‌افتد؟",
    answer:
      "در صورت عدم پذیرش، برنامه بازنگری رایگان دریافت می‌کنید و تیم پشتیبانی مسیر جایگزین و مهلت‌های آتی را به شما اطلاع می‌دهد.",
  },
];

function FAQ() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[40px] border border-white/60 bg-white/80 py-16 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="relative px-6 md:px-12">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium text-blue-600">پرسش‌های پرتکرار</p>
            <h2 className="text-3xl font-black leading-[1.6] md:text-4xl">
              هر آنچه باید پیش از شروع بدانید
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/50 bg-white/70 p-6 text-right shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 md:text-xl">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
