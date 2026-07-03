import React, { useState } from "react";
import { 
  Menu, X, Clock, BookOpen, Mail, Lock, Globe, Zap, Link2, 
  Settings, User, Globe as LanguageIcon, Moon, Trash2, LogOut,
  Upload, Share2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface SettingsMenuProps {
  onPublishApp?: () => void;
  onPublishWebsite?: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  onPublishApp,
  onPublishWebsite,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Upload, label: "Publish App", action: onPublishApp, highlight: true },
    { icon: Share2, label: "Publish Website", action: onPublishWebsite, highlight: true },
    { divider: true },
    { icon: Clock, label: "Scheduled tasks", action: () => navigate("/scheduled-tasks") },
    { icon: BookOpen, label: "Knowledge", action: () => navigate("/knowledge") },
    { icon: Mail, label: "Your Mail", action: () => navigate("/mail") },
    { icon: Lock, label: "Data controls", action: () => navigate("/data-controls") },
    { icon: Globe, label: "Cloud Browser", action: () => navigate("/cloud-browser") },
    { icon: Zap, label: "Skills", action: () => navigate("/skills") },
    { icon: Link2, label: "Connectors", action: () => navigate("/connectors") },
    { icon: Settings, label: "Integrations", action: () => navigate("/integrations") },
    { divider: true },
    { icon: User, label: "Account", action: () => navigate("/account") },
    { icon: LanguageIcon, label: "Language", action: () => navigate("/language"), subtext: "English" },
    { icon: Moon, label: "Appearance", action: () => navigate("/appearance") },
    { divider: true },
    { icon: Trash2, label: "Clear cache", action: () => {
      localStorage.clear();
      sessionStorage.clear();
      alert("Cache cleared!");
    }},
    { icon: LogOut, label: "Logout", action: () => {
      logout();
      navigate("/login");
    }},
  ];

  return (
    <div className="relative">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white hover:bg-slate-700/50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={`divider-${index}`} className="border-t border-slate-700" />
                );
              }

              const Icon = item.icon;
              const isHighlight = item.highlight;

              return (
                <button
                  key={index}
                  onClick={() => {
                    item.action?.();
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    isHighlight
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                      : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.subtext && (
                      <div className={`text-xs ${isHighlight ? "text-blue-100" : "text-gray-500"}`}>
                        {item.subtext}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
