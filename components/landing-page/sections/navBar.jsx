"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "../../Logo";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "خانه", href: "#" },
    { label: "پلن ها", href: "#" },
    { label: "تماس با ما", href: "#" },
    { label: "درباره ما", href: "#" },
  ];

  return (
    <nav className="w-full flex items-center justify-between p-4 text-sm font-medium relative flex-row-reverse">
      {/* Right side: logo + title (hidden on mobile) */}
      <div className="hidden md:flex items-center shrink-0">
        <h2 className="font-black text-[22px]">وآند</h2>
        <Logo size={30} className="ml-2 shrink-0" />
      </div>

      {/* Center title (visible only on mobile) */}
      <div className="flex md:hidden w-full justify-end">
        <h2 className="font-black text-[20px]">وآند</h2>
        <Logo size={30} className="ml-2 shrink-0" />
      </div>

      {/* Desktop menu */}
      <ul className="hidden md:flex gap-3  lg:gap-10 items-center">
        {navItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="hover:underline transition-colors duration-200"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop login button */}
      <motion.button
        whileHover={{ scale: 1.0, backgroundColor: "#e5e5e5" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="hidden md:inline bg-gray-100 rounded-full text-black px-6 py-2 ml-6 cursor-pointer"
      >
        ورود
      </motion.button>

      {/* Mobile menu toggle (sandwich) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="md:hidden absolute left-4 top-4 p-2 rounded-lg border border-gray-200"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 left-4 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg flex flex-col items-end gap-3 p-4 text-sm font-medium md:hidden z-100"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="w-full text-right hover:underline py-2 border-b border-gray-100 last:border-none"
              >
                {item.label}
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-100 rounded-full text-black px-6 py-2 mt-2 w-full text-center"
              onClick={() => setOpen(false)}
            >
              ورود
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
