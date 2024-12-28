// src/components/layout/topbar/ProfileMenu.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, HelpCircle, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/use-toast";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "See you again soon!",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2"
        >
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          <div className="py-1">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
              <HelpCircle size={16} />
              <span>Help Center</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-red-500"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ProfileButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  const { user } = useAuthStore();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
        {user?.firstName?.[0] || <User size={16} />}
      </div>
    </motion.button>
  );
};
