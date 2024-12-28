// src/components/layout/topbar/MobileDrawer.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MenuItem, { menuItems } from "./MenuItems";
import AppGrid, { apps } from "./AppGrid";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const drawerVariants = {
  closed: {
    x: "-100%",
    transition: { type: "tween", duration: 0.3 },
  },
  open: {
    x: 0,
    transition: { type: "tween", duration: 0.3 },
  },
};

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          <motion.div
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 bottom-0 w-full max-w-[320px] bg-white dark:bg-gray-900 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold meta-gradient text-transparent bg-clip-text">
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <MenuItem key={item.path} {...item} />
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-400">Workspace</p>
                </div>
                <AppGrid apps={apps} onAppClick={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
