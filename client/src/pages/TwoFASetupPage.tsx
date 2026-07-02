import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TwoFASetupPage() {
  const [step, setStep] = useState<"initial" | "setup" | "verify" | "complete">("initial");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSecretMutation = trpc.twoFA.generateSecret.useQuery();
  const setupTOTPMutation = trpc.twoFA.setupTOTP.useMutation();

  const handleGenerateSecret = async () => {
    try {
      setLoading(true);
      const result = await generateSecretMutation.refetch();
      if (result.data) {
        setSecret(result.data.secret);
        setQrCode(result.data.qrCode);
        setBackupCodes(result.data.backupCodes);
        setStep("setup");
      }
    } catch (err) {
      setError("Failed to generate 2FA secret");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      await setupTOTPMutation.mutateAsync({
        secret,
        code: verificationCode,
        backupCodes,
      });

      setStep("complete");
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Set Up Two-Factor Authentication</CardTitle>
            <CardDescription className="text-slate-400">
              Secure your account with 2FA using an authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "initial" && (
              <div className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertDescription className="text-blue-200">
                    Two-Factor Authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleGenerateSecret}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Start Setup"
                  )}
                </Button>
              </div>
            )}

            {step === "setup" && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Manual Entry Key</label>
                  <div className="flex gap-2">
                    <Input
                      value={secret}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={() => copyToClipboard(secret, "secret")}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      {copiedCode === "secret" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Backup Codes</label>
                  <p className="text-xs text-slate-400 mb-3">
                    Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-slate-700 p-3 rounded flex justify-between items-center"
                      >
                        <span className="text-sm font-mono text-white">{code}</span>
                        <Button
                          onClick={() => copyToClipboard(code, `backup-${index}`)}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedCode === `backup-${index}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Verification Code</label>
                  <p className="text-xs text-slate-400 mb-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
                  />
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify and Enable 2FA"
                  )}
                </Button>
              </div>
            )}

            {step === "complete" && (
              <div className="space-y-4 text-center">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    ✓ Two-Factor Authentication Enabled
                  </h3>
                  <p className="text-sm text-green-200">
                    Your account is now protected with 2FA. You'll be asked to enter a code from your authenticator app when you log in.
                  </p>
                </div>

                <Button
                  onClick={() => window.location.href = "/profile-settings"}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Back to Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
