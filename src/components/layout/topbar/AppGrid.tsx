// src/components/layout/topbar/AppGrid.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Activity, MessageSquare, Box, Users } from "lucide-react";

export interface AppItem {
  icon: React.ElementType;
  name: string;
  description: string;
  path: string;
}

const MemoizedIcon = React.memo(
  ({
    icon: Icon,
    ...props
  }: {
    icon: React.ElementType;
    [key: string]: any;
  }) => <Icon {...props} />
);

export const apps: AppItem[] = [
  {
    icon: Activity,
    name: "Analytics",
    description: "Track your performance",
    path: "/analytics",
  },
  {
    icon: MessageSquare,
    name: "Messages",
    description: "Chat with your team",
    path: "/messages",
  },
  {
    icon: Box,
    name: "Products",
    description: "Manage inventory",
    path: "/products",
  },
  {
    icon: Users,
    name: "Team",
    description: "Collaborate with team",
    path: "/team",
  },
];

interface AppGridProps {
  apps: AppItem[];
  onAppClick: () => void;
}

const AppGrid = React.memo(({ apps, onAppClick }: AppGridProps) => (
  <div className="grid grid-cols-2 gap-2 p-2">
    {apps.map((app) => (
      <Link
        key={app.name}
        to={app.path}
        onClick={onAppClick}
        className="flex flex-col gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-fit">
          <MemoizedIcon icon={app.icon} size={20} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {app.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {app.description}
          </p>
        </div>
      </Link>
    ))}
  </div>
));

export default AppGrid;
