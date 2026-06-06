import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import ModelSwitcher from "./ModelSwitcher";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ModelSwitcherConnectedProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  action?: "chat" | "video_edit" | "image_generate";
}

export default function ModelSwitcherConnected({
  selectedModel,
  onModelChange,
  action = "chat",
}: ModelSwitcherConnectedProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Fetch available models for user's tier
  const { data: availableModelsData, isLoading: modelsLoading } = trpc.modelEnforcement.getAvailableModels.useQuery(
    undefined,
    {
      enabled: !!user,
      onError: (err) => {
        setError(err.message || "Failed to load available models");
      },
    }
  );

  // Validate model selection before use
  const validateModel = trpc.modelEnforcement.validateModelSelection.useMutation({
    onError: (err) => {
      setError(err.message || "Model validation failed");
    },
  });

  const handleModelChange = async (modelId: string) => {
    setError(null);

    // Validate model selection
    const validation = await validateModel.mutateAsync({
      modelId,
      action,
    });

    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    onModelChange(modelId);
  };

  if (modelsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!availableModelsData) {
    return (
      <Alert className="bg-red-600/20 border-red-500/30">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">Failed to load models. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert className="bg-red-600/20 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      <ModelSwitcher
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        availableModels={availableModelsData.models}
        userTier={availableModelsData.tier as "free" | "starter" | "premium" | "enterprise"}
        isLoading={validateModel.isPending}
      />

      {/* Quota Warning */}
      {action === "video_edit" && (
        <Alert className="bg-blue-600/20 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            Video editing with {availableModelsData.models.find((m) => m.id === selectedModel)?.name} will use your
            monthly quota
          </AlertDescription>
        </Alert>
      )}

      {action === "image_generate" && (
        <Alert className="bg-blue-600/20 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            Image generation with {availableModelsData.models.find((m) => m.id === selectedModel)?.name} will use your
            monthly quota
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
