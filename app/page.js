import NavBar from "@/components/landing-page/navBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";

export default function Home() {
  return (
    <section className="rtl w-full min-h-screen flex flex-col md:flex-row items-start overflow-hidden">
      {/* Left half (background image) */}
      <div
        className="w-full md:w-1/2 h-[300px] md:h-[740px] bg-cover bg-center rounded-[20px] mt-2 mr-2 md:m-8 flex items-end justify-start"
        style={{ backgroundImage: "url('/hero-image.png')" }}
      >
        <div className="hidden sm:block w-[180px] md:w-[260px] h-[120px] md:h-40 bg-white rounded-md m-6 md:m-[50px]" />
      </div>

      {/* Right half (navbar + text) */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-start p-3 md:p-4">
        {/* Navbar */}
        <NavBar />

        {/* Text content */}
        <div
          className="flex flex-col justify-center h-full pr-0 md:pr-16 text-right mt-20"
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

          <div className="flex flex-wrap gap-3 mt-10">
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
