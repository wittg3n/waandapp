import NavBar from "@/components/landing-page/navBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";
export default function Home() {
  return (
    <section className="rtl w-full h-screen flex">
      {/* Left half (background image) */}
      <div
        className="w-1/2 h-[740px] bg-cover bg-center rounded-[20px] m-8"
        style={{ backgroundImage: "url('/hero-image.png')" }}
      >
        <div className="w-[260px] h-[160px] bg-white rounded-md m-[50px]"></div>
      </div>

      {/* Right half (navbar + text) */}
      <div className="w-1/2 h-full flex flex-col justify-between p-10">
        {/* Navbar */}
        <NavBar />

        {/* Text content */}
        <div className="flex flex-col justify-center h-full pr-16" dir="rtl">
          <p className="text-gray-500 mb-2">✨ تمام با هوش مصنوعی</p>
          <h1 className="text-[70px]  leading-[1.4] mb-4 font-black">
            تا اینجا تلاش کردی
            <br />
            بقیه‌شو بسپر به
            <br />
            <span className="text-blue-600">
              {" "}
              <LineShadowText>هوش</LineShadowText>
              <LineShadowText>مصنوعی</LineShadowText>
            </span>
          </h1>
          <p className="text-gray-500 text-sm font-light leading-relaxed max-w-md mb-8">
            استفاده از هوش مصنوعی در اپلای دانشگاه‌ها فرآیند انتخاب، نگارش
            انگیزه‌نامه و آماده‌سازی مدارک را هوشمند، دقیق و شخصی‌سازی‌شده
            می‌کند و شانس پذیرش دانشجویان را بطور چشم‌گیری افزایش می‌دهد.
          </p>

          <div className="flex gap-4">
            <button className="bg-black text-white rounded-full px-6 py-2">
              ورود رایگان
            </button>
            <button className="border border-gray-300 rounded-full px-6 py-2">
              تماس با ما
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
