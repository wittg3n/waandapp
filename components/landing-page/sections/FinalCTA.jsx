import React from "react";
import { Button } from "../../ui/button";
import { LineShadowText } from "../../ui/line-shadow-text";

function FinalCTA() {
  return (
    <section className="relative mt-24" dir="rtl">
      <div className="absolute inset-0 mx-auto max-w-5xl rounded-[48px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-white/80">
          آینده از امروز شروع می‌شود
        </p>
        <h2 className="mt-6 text-3xl font-black leading-[1.6] md:text-5xl">
          <LineShadowText className="text-white" shadowColor="#0ea5e9">
            آماده پرواز؟
          </LineShadowText>
          <br />
          همین حالا وااند را تجربه کنید
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
          ثبت‌نام کنید، پروفایل خود را بسازید و کمتر از ۴۸ ساعت اولین برنامه شخصی‌سازی‌شده را دریافت کنید. تیم پشتیبانی ما در کنار شماست تا هیچ مهلتی را از دست ندهید.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="rounded-full bg-white px-10 py-6 text-base font-semibold text-blue-600 hover:bg-white/90">
            شروع رایگان ۷ روزه
          </Button>
          <Button className="rounded-full border border-white/40 bg-transparent px-10 py-6 text-base font-semibold text-white hover:bg-white/10">
            جلسه مشاوره رزرو کنید
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
