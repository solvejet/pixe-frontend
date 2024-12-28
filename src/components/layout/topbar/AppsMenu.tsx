// src/components/layout/topbar/AppsMenu.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid } from "lucide-react";
import AppGrid, { apps } from "./AppGrid";

interface AppsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsMenu: React.FC<AppsMenuProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2"
        >
          <AppGrid apps={apps} onAppClick={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const AppsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    <Grid size={20} className="text-gray-600 dark:text-gray-300" />
  </motion.button>
);
