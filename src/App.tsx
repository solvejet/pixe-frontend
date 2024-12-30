// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth.store";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";

// Lazy load pages
const LoginPage = React.lazy(() => import("@/pages/auth/Login"));
const DashboardPage = React.lazy(() => import("@/pages/dashboard"));

// Loading Spinner Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="text-gray-600 dark:text-gray-300">Loading...</span>
    </motion.div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, tokens } = useAuthStore();
  const location = useLocation();
  const { toast } = useToast();

  console.log("ProtectedRoute - Auth State:", {
    isAuthenticated,
    hasTokens: !!tokens,
    currentPath: location.pathname,
  });

  useEffect(() => {
    if (!isAuthenticated || !tokens) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to access this page.",
      });
    }
  }, [isAuthenticated, tokens, toast]);

  if (!isAuthenticated || !tokens) {
    console.log("Redirecting to login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (prevents authenticated users from accessing login/register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return <>{children}</>;
};

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

function App() {
  const { toast } = useToast();

  // Handle authentication errors
  useEffect(() => {
    const handleAuthError = () => {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, [toast]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <PageTransition>
                      <LoginPage />
                    </PageTransition>
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PageTransition>
                        <DashboardPage />
                      </PageTransition>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Page not found
                        </p>
                        <button
                          onClick={() => window.history.back()}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Go back
                        </button>
                      </div>
                    </div>
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>

        {/* Toast Notifications */}
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
