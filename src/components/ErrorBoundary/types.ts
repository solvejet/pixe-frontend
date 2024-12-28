// src/components/ErrorBoundary/types.ts
export type ErrorBoundaryProps = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

export type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};