// src/components/ui/card.tsx
import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  gradient = false,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl bg-white dark:bg-gray-800 
        ${gradient ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900" : ""}
        ${hoverable ? "transition-transform hover:scale-[1.02] cursor-pointer" : ""}
        shadow-sm dark:shadow-gray-900
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
