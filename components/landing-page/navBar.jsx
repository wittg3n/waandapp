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
    <nav className="w-full flex items-center p-4 text-sm font-medium relative flex-row-reverse">
      {/* Logo on the right */}
      <Logo size={30} className="ml-2" />
      <h2 className="font-black ml-20 text-[20px]">وآند</h2>

      {/* Desktop menu */}
      <ul className="hidden md:flex gap-20   ">
        {navItems.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <Button className={"bg-gray-100 mr-20 rounded-4xl text-black"}>
        ورود
      </Button>
      {/* Mobile button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-4 bg-transparent backdrop-blur-md border border-white/10 rounded-xl shadow-lg flex flex-col items-end gap-3 p-4 text-sm font-medium md:hidden"
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
