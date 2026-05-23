"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Zap,
  RefreshCw,
  Save,
} from "lucide-react";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputPrice: number;
  outputPrice: number;
}

export interface FeatureFlags {
  lspEnabled: boolean;
  costTrackingEnabled: boolean;
  cacheEnabled: boolean;
  multiAgentEnabled: boolean;
  snapshotEnabled: boolean;
}

export interface SettingsConfig {
  defaultModel: string;
  interactionMode: "plan" | "agent" | "yolo";
  language: string;
  theme: "light" | "dark" | "system";
  features: FeatureFlags;
  alerts: {
    sessionThreshold: number;
    dailyThreshold: number;
  };
}

export function SettingsPage() {
  const [config, setConfig] = useState<SettingsConfig>({
    defaultModel: "deepseek-chat",
    interactionMode: "agent",
    language: "zh-CN",
    theme: "system",
    features: {
      lspEnabled: true,
      costTrackingEnabled: true,
      cacheEnabled: true,
      multiAgentEnabled: false,
      snapshotEnabled: true,
    },
    alerts: {
      sessionThreshold: 1.0,
      dailyThreshold: 10.0,
    },
  });

  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/models");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Failed to load models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = <K extends keyof SettingsConfig>(
    key: K,
    value: SettingsConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateFeature = (key: keyof FeatureFlags, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateAlert = (key: "sessionThreshold" | "dailyThreshold", value: number) => {
    setConfig((prev) => ({
      ...prev,
      alerts: { ...prev.alerts, [key]: value },
    }));
    setHasChanges(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">设置</h1>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存更改
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            通用
          </TabsTrigger>
          <TabsTrigger value="model">
            <Zap className="h-4 w-4 mr-2" />
            模型
          </TabsTrigger>
          <TabsTrigger value="features">
            <Shield className="h-4 w-4 mr-2" />
            功能
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            警告
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>通用设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">语言</Label>
                <Select
                  value={config.language}
                  onValueChange={(v) => updateConfig("language", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">主题</Label>
                <Select
                  value={config.theme}
                  onValueChange={(v) => updateConfig("theme", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">交互模式</Label>
                <Select
                  value={config.interactionMode}
                  onValueChange={(v) => updateConfig("interactionMode", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan">Plan (只读探索)</SelectItem>
                    <SelectItem value="agent">Agent (默认交互)</SelectItem>
                    <SelectItem value="yolo">YOLO (自动批准)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>模型设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">默认模型</Label>
                <Select
                  value={config.defaultModel}
                  onValueChange={(v) => updateConfig("defaultModel", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {models.length > 0 && (
                <div className="space-y-2">
                  <Label>可用模型</Label>
                  <div className="grid gap-2">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {model.provider} · 上下文 {model.contextWindow.toLocaleString()} tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            ${model.inputPrice}/1M 输入
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${model.outputPrice}/1M 输出
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>功能开关</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>LSP 诊断</Label>
                  <p className="text-sm text-muted-foreground">
                    启用实时代码诊断和错误检测
                  </p>
                </div>
                <Switch
                  checked={config.features.lspEnabled}
                  onCheckedChange={(v) => updateFeature("lspEnabled", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>成本追踪</Label>
                  <p className="text-sm text-muted-foreground">
                    启用多维度成本统计和分析
                  </p>
                </div>
                <Switch
                  checked={config.features.costTrackingEnabled}
                  onCheckedChange={(v) => updateFeature("costTrackingEnabled", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>语义缓存</Label>
                  <p className="text-sm text-muted-foreground">
                    启用智能缓存以减少重复请求
                  </p>
                </div>
                <Switch
                  checked={config.features.cacheEnabled}
                  onCheckedChange={(v) => updateFeature("cacheEnabled", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>多Agent协作</Label>
                  <p className="text-sm text-muted-foreground">
                    启用Leader/Worker/Verifier角色体系
                  </p>
                </div>
                <Switch
                  checked={config.features.multiAgentEnabled}
                  onCheckedChange={(v) => updateFeature("multiAgentEnabled", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>工作区快照</Label>
                  <p className="text-sm text-muted-foreground">
                    启用工作区快照和回滚功能
                  </p>
                </div>
                <Switch
                  checked={config.features.snapshotEnabled}
                  onCheckedChange={(v) => updateFeature("snapshotEnabled", v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>成本警告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionThreshold">会话阈值 ($)</Label>
                <Input
                  id="sessionThreshold"
                  type="number"
                  step="0.1"
                  value={config.alerts.sessionThreshold}
                  onChange={(e) =>
                    updateAlert("sessionThreshold", parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  当单次会话成本超过此阈值时发出警告
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="dailyThreshold">每日阈值 ($)</Label>
                <Input
                  id="dailyThreshold"
                  type="number"
                  step="1"
                  value={config.alerts.dailyThreshold}
                  onChange={(e) =>
                    updateAlert("dailyThreshold", parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  当每日累计成本超过此阈值时发出警告
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
