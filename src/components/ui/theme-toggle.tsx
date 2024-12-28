// src/components/ui/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useDarkMode } from "@/hooks/useDarkMode";

export function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-blue-500" />
      )}
    </motion.button>
  );
}
