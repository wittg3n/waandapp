"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "درباره ما", href: "#" },
    { label: "تماس با ما", href: "#" },
    { label: "پلن ها", href: "#" },
    { label: "خانه", href: "#" },
  ];

  return (
    <nav className="w-full flex items-center justify-between p-4 text-sm font-medium relative flex-row-reverse">
      {/* Right side: logo and title */}
      <div className="flex items-center shrink-0">
        <h2 className="font-black text-[22px]">وآند</h2>

        <Logo size={40} className="ml-2 shrink-0" />
      </div>

      {/* Desktop menu */}
      <ul className="hidden md:flex gap-16">
        {navItems.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Login button */}
      <Button className="bg-gray-100 rounded-full text-black px-6 py-2 ml-6">
        ورود
      </Button>

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg flex flex-col items-end gap-3 p-4 text-sm font-medium md:hidden"
          >
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}
