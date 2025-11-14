"use client";
import React, { useRef, useEffect, useState } from "react";

function Marquee({ speed = 40, children }) {
  const contentRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;

    const measure = () => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
      }
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    } else {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
  }, [children]);

  const duration = contentWidth && speed ? contentWidth / speed : 0;

  return (
    <div className="marquee-container">
      <div
        className="marquee-track"
        style={{
          animation: contentWidth
            ? `marquee ${duration}s linear infinite`
            : "none",
        }}
      >
        {/* original */}
        <div className="marquee-group" ref={contentRef}>
          {children}
        </div>
        {/* clone */}
        <div className="marquee-group">{children}</div>
      </div>

      <style jsx>{`
        .marquee-container {
          overflow: hidden;
          width: 100%;
        }

        .marquee-track {
          display: inline-flex;
          white-space: nowrap;
        }

        .marquee-group {
          display: inline-flex;
          align-items: center;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default Marquee;
