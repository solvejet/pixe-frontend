// src/components/layout/topbar/MenuItems.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Users, Calendar, FolderClosed, Home } from "lucide-react";

export interface MenuItem {
  icon: React.ElementType;
  name: string;
  path: string;
  badge?: number;
}

const MenuItem = React.memo(({ icon: Icon, name, path, badge }: MenuItem) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{name}</span>
      {badge && (
        <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
});

export const menuItems: MenuItem[] = [
  { icon: Home, name: "Dashboard", path: "/" },
  { icon: BarChart2, name: "Analytics", path: "/analytics" },
  { icon: Users, name: "Customers", path: "/customers" },
  { icon: Calendar, name: "Calendar", path: "/calendar" },
  { icon: FolderClosed, name: "Projects", path: "/projects", badge: 3 },
];

export default MenuItem;
