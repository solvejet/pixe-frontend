// src/components/ui/navigation.tsx
import React from "react";
import { Home, Grid, Settings, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Grid, label: "Apps" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
];

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-t-3xl border-t dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around py-4">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
