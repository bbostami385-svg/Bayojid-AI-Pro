import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Zap, AlertCircle } from "lucide-react";

export interface ChatModel {
  modelId: string;
  name: string;
  tier: "free" | "pro" | "premium" | "enterprise";
  isFree: boolean;
  costPerRequest: number;
  status: "online" | "offline" | "degraded";
  responseTime: number;
  uptime: number;
}

interface ChatModelSwitcherProps {
  currentModel: ChatModel;
  availableModels: ChatModel[];
  userCredits: number;
  onModelChange: (model: ChatModel) => void;
  disabled?: boolean;
}

export function ChatModelSwitcher({
  currentModel,
  availableModels,
  userCredits,
  onModelChange,
  disabled = false,
}: ChatModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredModels, setFilteredModels] = useState<ChatModel[]>(availableModels);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = availableModels.filter((model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [searchTerm, availableModels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "free":
        return "default";
      case "pro":
        return "secondary";
      case "premium":
        return "destructive";
      case "enterprise":
        return "outline";
      default:
        return "default";
    }
  };

  const canAffordModel = (model: ChatModel) => {
    return userCredits >= model.costPerRequest;
  };

  return (
    <div className="relative w-full">
      {/* Current Model Display */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        variant="outline"
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(currentModel.status)}`} />
          <span className="font-medium">{currentModel.name}</span>
          <Badge variant={getTierBadgeVariant(currentModel.tier)} className="ml-2">
            {currentModel.tier}
          </Badge>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          {/* Search Input */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm"
            />
          </div>

          {/* Model List */}
          <div className="divide-y">
            {filteredModels.map((model) => {
              const canAfford = canAffordModel(model);
              const isSelected = model.modelId === currentModel.modelId;

              return (
                <button
                  key={model.modelId}
                  onClick={() => {
                    if (canAfford || model.isFree) {
                      onModelChange(model);
                      setIsOpen(false);
                    }
                  }}
                  disabled={!canAfford && !model.isFree}
                  className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${
                    isSelected ? "bg-accent" : ""
                  } ${!canAfford && !model.isFree ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Status Indicator */}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`} />

                      {/* Model Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant={getTierBadgeVariant(model.tier)} className="text-xs">
                            {model.tier}
                          </Badge>
                          {model.isFree && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Free
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {model.costPerRequest} credits/request
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="text-right ml-4">
                      <div className="text-xs text-muted-foreground">
                        <div>{model.responseTime}ms</div>
                        <div>{model.uptime}% uptime</div>
                      </div>
                    </div>
                  </div>

                  {/* Insufficient Credits Warning */}
                  {!canAfford && !model.isFree && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Insufficient credits ({userCredits}/{model.costPerRequest})</span>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="text-xs text-green-600 mt-2 font-medium">✓ Currently selected</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredModels.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No models found matching "{searchTerm}"
            </div>
          )}

          {/* Model Stats Footer */}
          <div className="p-3 border-t bg-muted/50 text-xs text-muted-foreground">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="font-medium text-foreground">
                  {availableModels.filter((m) => m.status === "online").length}
                </div>
                <div>Online</div>
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {availableModels.filter((m) => m.isFree).length}
                </div>
                <div>Free</div>
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {Math.min(...availableModels.map((m) => m.costPerRequest))}
                </div>
                <div>Min cost</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ChatModelSwitcher;
