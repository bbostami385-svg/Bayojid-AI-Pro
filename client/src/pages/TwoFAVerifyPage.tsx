import { useState } from "react";
import { useNavigate, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TwoFAVerifyPage() {
  const [, navigate] = useLocation();
  const router = useNavigate();
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const verify2FAMutation = trpc.twoFA.verify2FA.useMutation();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    try {
      setLoading(true);

      const result = await verify2FAMutation.mutateAsync({
        code: code.trim(),
        isBackupCode: useBackupCode,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router("/dashboard");
        }, 1500);
      } else {
        setError(result.message || "Invalid code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-purple-500/20">
        <CardHeader className="space-y-2">
          <CardTitle className="text-white text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-slate-400">
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="flex gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">Verification successful! Redirecting...</p>
              </div>
            )}

            {/* Code Input */}
            <div>
              <Label className="text-white mb-2 block">
                {useBackupCode ? "Backup Code" : "Authentication Code"}
              </Label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={useBackupCode ? "XXXX-XXXX-XXXX" : "000000"}
                maxLength={useBackupCode ? 14 : 6}
                className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest font-mono"
                disabled={loading || success}
                autoFocus
              />
              <p className="text-slate-400 text-xs mt-2">
                {useBackupCode
                  ? "Format: XXXX-XXXX-XXXX"
                  : "Enter 6 digits without spaces"}
              </p>
            </div>

            {/* Toggle Backup Code */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode("");
                  setError("");
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                {useBackupCode ? "Use authenticator code instead" : "Use backup code instead"}
              </button>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={loading || success || !code.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                "Verified!"
              ) : (
                "Verify"
              )}
            </Button>

            {/* Help Text */}
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-slate-300 text-xs">
                <strong>Don't have your authenticator app?</strong> Use one of your backup codes instead. Each code can only be used once.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
