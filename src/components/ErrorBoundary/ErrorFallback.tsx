// src/components/ErrorBoundary/ErrorFallback.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

type ErrorFallbackProps = {
  error: Error | null;
  resetError: () => void;
};

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background dark:bg-background-dark">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Something went wrong
        </h2>
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            An error occurred while rendering this page.
          </p>
          {error && (
            <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-40 mb-4">
              {error.message}
            </pre>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
