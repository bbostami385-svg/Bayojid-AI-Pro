import React, { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export function OAuthCallbackPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [error, setError] = useState("");

  // Parse URL parameters
  const params = new URLSearchParams(searchParams);
  const code = params.get("code");
  const state = params.get("state");
  const provider = params.get("provider") || "google";

  // Determine which mutation to use based on provider
  const googleCallbackMutation = trpc.oauth.googleCallback.useMutation();
  const githubCallbackMutation = trpc.oauth.githubCallback.useMutation();

  useEffect(() => {
    if (!code) {
      setError("No authorization code received");
      return;
    }

    const handleCallback = async () => {
      try {
        if (provider === "github") {
          await githubCallbackMutation.mutateAsync({
            code,
            state: state || undefined,
          });
        } else {
          await googleCallbackMutation.mutateAsync({
            code,
            state: state || undefined,
          });
        }
        // Redirect to dashboard on success
        setLocation("/dashboard");
      } catch (err: any) {
        setError(err.message || "Authentication failed");
      }
    };

    handleCallback();
  }, [code, provider, state]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h1>
          <p className="text-red-300 mb-4">{error}</p>
          <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
        <h1 className="text-2xl font-bold text-white">Completing Sign In...</h1>
        <p className="text-gray-400">Please wait while we authenticate your account</p>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
