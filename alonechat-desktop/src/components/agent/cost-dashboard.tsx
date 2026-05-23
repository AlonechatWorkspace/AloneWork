"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Database,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";

export interface CostData {
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  turnCount: number;
  modelCosts: Record<string, number>;
  duration: number;
}

export interface DailyCostData {
  date: string;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  sessionCount: number;
}

export interface CostDashboardProps {
  sessionId?: string;
  onRefresh?: () => void;
  className?: string;
}

export function CostDashboard({
  sessionId,
  onRefresh,
  className,
}: CostDashboardProps) {
  const [period, setPeriod] = useState<"session" | "day" | "week" | "month">("session");
  const [currentCost, setCurrentCost] = useState<CostData | null>(null);
  const [history, setHistory] = useState<DailyCostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCostData();
  }, [period, sessionId]);

  const loadCostData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (sessionId) {
        params.set("session_id", sessionId);
      }
      const response = await fetch(`/api/cost?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentCost(data.current);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to load cost data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(2)}M`;
    } else if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const cacheHitRate = currentCost
    ? currentCost.cacheReadTokens /
      (currentCost.cacheReadTokens + currentCost.inputTokens || 1)
    : 0;

  const topModels = currentCost
    ? Object.entries(currentCost.modelCosts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            成本仪表板
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as any)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">当前会话</SelectItem>
                <SelectItem value="day">今日</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadCostData();
                onRefresh?.();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentCost ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">总成本</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCost(currentCost.totalCost)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">输入Token</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatTokens(currentCost.inputTokens)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">输出Token</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatTokens(currentCost.outputTokens)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">缓存命中</span>
                </div>
                <div className="text-2xl font-bold">
                  {(cacheHitRate * 100).toFixed(1)}%
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">缓存命中率</span>
                <span className="text-sm text-muted-foreground">
                  {formatTokens(currentCost.cacheReadTokens)} /{" "}
                  {formatTokens(currentCost.cacheReadTokens + currentCost.inputTokens)}
                </span>
              </div>
              <Progress value={cacheHitRate * 100} />
            </div>

            {topModels.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">模型成本分布</h4>
                <div className="space-y-2">
                  {topModels.map(([model, cost]) => {
                    const percentage =
                      (cost / currentCost.totalCost) * 100 || 0;
                    return (
                      <div key={model} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{model}</span>
                          <span className="text-muted-foreground">
                            {formatCost(cost)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">历史趋势</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {history.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{day.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {day.sessionCount} 会话
                          </Badge>
                          <span className="font-medium">
                            {formatCost(day.totalCost)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {currentCost.turnCount} 轮对话 · 平均{" "}
                {formatCost(
                  currentCost.turnCount > 0
                    ? currentCost.totalCost / currentCost.turnCount
                    : 0
                )}
                /轮
              </span>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-1" />
                导出报告
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <DollarSign className="h-8 w-8 mb-2 opacity-50" />
            <p>暂无成本数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
