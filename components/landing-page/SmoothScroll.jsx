"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import ResizeObserver from "resize-observer-polyfill";
import {
  useViewportScroll,
  useTransform,
  useSpring,
  motion,
} from "framer-motion";

const SmoothScroll = ({ children }) => {
  const scrollRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);

  // تابعی برای بروزرسانی ارتفاع کل محتوا
  const resizePageHeight = useCallback((entries) => {
    for (let entry of entries) {
      setPageHeight(entry.contentRect.height);
    }
  }, []);

  // مشاهده تغییر اندازه محتوای scrollRef
  useEffect(() => {
    if (!scrollRef.current) return;

    const resizeObserver = new ResizeObserver((entries) =>
      resizePageHeight(entries)
    );
    resizeObserver.observe(scrollRef.current);

    // پاکسازی هنگام unmount
    return () => resizeObserver.disconnect();
  }, [scrollRef, resizePageHeight]);

  // مقدار اسکرول واقعی صفحه
  const { scrollY } = useViewportScroll();

  // نگاشت اسکرول به translateY منفی
  const transform = useTransform(scrollY, [0, pageHeight], [0, -pageHeight]);

  // اعمال حرکت نرم (فنری)
  const spring = useSpring(transform, {
    damping: 15,
    mass: 0.27,
    stiffness: 55,
  });

  return (
    <>
      <motion.div
        ref={scrollRef}
        style={{
          y: spring,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          willChange: "transform", // برای بهبود performance
        }}
        className="scroll-container"
      >
        {children}
      </motion.div>

      {/* div خالی برای ایجاد فضای اسکرول طبیعی */}
      <div style={{ height: pageHeight }} />
    </>
  );
};

export default SmoothScroll;
