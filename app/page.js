import NavBar from "@/components/landing-page/navBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { Heart } from "lucide-react";
export default function Home() {
  return (
    <section className="rtl w-full min-h-screen flex flex-col md:flex-row items-start overflow-hidden">
      {/* Left half (background image) — hidden on mobile */}
      <div
        className="hidden md:flex w-full md:w-1/2 h-[300px] md:h-[740px] bg-cover bg-center rounded-[20px] mt-2 ml-2 md:mt-8 md:ml-8 items-end justify-end"
        style={{ backgroundImage: "url('/hero-image.png')" }}
      >
        <div className=" md:w-[300px] backdrop-blur-2xl  md:h-20 bg-white/80 rounded-full m-6 md:m-[50px] md:mb-20 p-4">
          <div
            className="flex justify-end items-center h-full w-full "
            dir="rtl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="url(#heartGradient)"
              className="size-12 ml-2"
            >
              <defs>
                <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87C9FF" />
                  <stop offset="100%" stopColor="#BAEAFE" />
                </linearGradient>
              </defs>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2>ساخته شده توسط دانشجویان برای دانشجویان</h2>
          </div>
        </div>
      </div>

      {/* Right half (navbar + text) */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-start p-3 md:p-4">
        {/* Navbar */}
        <NavBar />

        {/* Text content */}
        <div
          className="
            flex flex-col justify-center h-full pr-0 md:pr-16 
            mt-20 
            md:items-start 
            items-center text-center md:text-right
          "
          dir="rtl"
        >
          <p className="text-gray-500 mb-2 text-sm md:text-base">
            ✨ تمام با هوش مصنوعی
          </p>

          <h1 className="text-[clamp(2rem,4vw,4.5rem)] leading-[1.4] mb-4 font-black">
            تا اینجا تلاش کردی
            <br />
            بقیه‌شو بسپر به
            <br />
            <span className="text-blue-600 inline-block">
              <LineShadowText>هوش</LineShadowText>{" "}
              <LineShadowText>مصنوعی</LineShadowText>
            </span>
          </h1>

          <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-md mb-8">
            استفاده از هوش مصنوعی در اپلای دانشگاه‌ها فرآیند انتخاب، نگارش
            انگیزه‌نامه و آماده‌سازی مدارک را هوشمند، دقیق و شخصی‌سازی‌شده
            می‌کند و شانس پذیرش دانشجویان را بطور چشم‌گیری افزایش می‌دهد.
          </p>

          <div className="flex flex-wrap gap-3 mt-10 justify-center md:justify-end">
            <button className="bg-black text-white rounded-full px-5 py-2 text-sm md:text-base">
              ورود رایگان
            </button>
            <button className="border border-gray-300 rounded-full px-5 py-2 text-sm md:text-base">
              تماس با ما
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
