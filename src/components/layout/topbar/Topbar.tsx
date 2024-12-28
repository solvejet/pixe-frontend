// src/components/layout/topbar/Topbar.tsx
import React, { useState } from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { AppsButton, AppsMenu } from "./AppsMenu";
import { ProfileButton, ProfileMenu } from "./ProfileMenu";
import { MobileDrawer } from "./MobileDrawer";
import MenuItem, { menuItems } from "./MenuItems";

export const Topbar = () => {
  const [showApps, setShowApps] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-2xl font-bold meta-gradient text-transparent bg-clip-text">
              Pixe
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.slice(0, 3).map((item) => (
                <MenuItem key={item.path} {...item} />
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-64 pl-10 pr-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <ThemeToggle />

            <div className="relative">
              <AppsButton onClick={() => setShowApps(!showApps)} />
              <AppsMenu isOpen={showApps} onClose={() => setShowApps(false)} />
            </div>

            <div className="relative">
              <ProfileButton onClick={() => setShowProfile(!showProfile)} />
              <ProfileMenu
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
              />
            </div>
          </div>
        </div>
      </div>

      <MobileDrawer
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
    </header>
  );
};
