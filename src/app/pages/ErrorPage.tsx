import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full text-center">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-6 sm:p-8">
          {/* Error Icon */}
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertTriangle className="w-8 sm:w-10 h-8 sm:h-10 text-red-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            {errorMessage}
          </p>

          {/* Error Status */}
          <p className="text-gray-600 text-sm mb-4">Error: {errorStatus}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-600/30 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 sm:w-5 h-4 sm:h-5" />
              Try Again
            </button>
            
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              <Home className="w-4 sm:w-5 h-4 sm:h-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

