// src/components/Layout.tsx
import React from "react";
import { Topbar } from "./layout/topbar/Topbar";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Topbar />
      <main className="pt-24 px-8 pb-8 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
};
