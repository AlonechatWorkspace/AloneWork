"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  Database,
} from "lucide-react";

export interface CostIndicatorProps {
  currentCost: number;
  sessionThreshold: number;
  dailyCost?: number;
  dailyThreshold?: number;
  cacheHitRate?: number;
  onOpenDashboard?: () => void;
  showDetails?: boolean;
}

export function CostIndicator({
  currentCost,
  sessionThreshold,
  dailyCost,
  dailyThreshold,
  cacheHitRate = 0,
  onOpenDashboard,
  showDetails = true,
}: CostIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sessionPercentage = (currentCost / sessionThreshold) * 100;
  const isSessionWarning = sessionPercentage >= 80;
  const isSessionExceeded = sessionPercentage >= 100;

  const dailyPercentage =
    dailyCost && dailyThreshold ? (dailyCost / dailyThreshold) * 100 : 0;
  const isDailyWarning = dailyPercentage >= 80;
  const isDailyExceeded = dailyPercentage >= 100;

  const getStatusColor = () => {
    if (isSessionExceeded || isDailyExceeded) return "text-red-500";
    if (isSessionWarning || isDailyWarning) return "text-yellow-500";
    return "text-green-500";
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  if (!showDetails) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${getStatusColor()}`}
        onClick={onOpenDashboard}
      >
        <DollarSign className="h-4 w-4" />
        <span className="ml-1 text-sm">{formatCost(currentCost)}</span>
        {(isSessionWarning || isDailyWarning) && (
          <AlertTriangle className="h-3 w-3 ml-1" />
        )}
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${getStatusColor()}`}
        >
          <DollarSign className="h-4 w-4" />
          <span className="ml-1 text-sm">{formatCost(currentCost)}</span>
          {(isSessionWarning || isDailyWarning) && (
            <AlertTriangle className="h-3 w-3 ml-1" />
          )}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">成本状态</h4>
            {onOpenDashboard && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDashboard();
                }}
              >
                查看详情
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  会话成本
                </span>
                <span className={isSessionExceeded ? "text-red-500" : ""}>
                  {formatCost(currentCost)} / {formatCost(sessionThreshold)}
                </span>
              </div>
              <Progress
                value={Math.min(sessionPercentage, 100)}
                className={`h-2 ${isSessionExceeded ? "bg-red-100" : ""}`}
              />
              {isSessionWarning && (
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {isSessionExceeded
                    ? "已超过会话阈值"
                    : "接近会话成本阈值"}
                </p>
              )}
            </div>

            {dailyCost !== undefined && dailyThreshold !== undefined && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    今日成本
                  </span>
                  <span className={isDailyExceeded ? "text-red-500" : ""}>
                    {formatCost(dailyCost)} / {formatCost(dailyThreshold)}
                  </span>
                </div>
                <Progress
                  value={Math.min(dailyPercentage, 100)}
                  className={`h-2 ${isDailyExceeded ? "bg-red-100" : ""}`}
                />
                {isDailyWarning && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {isDailyExceeded
                      ? "已超过每日阈值"
                      : "接近每日成本阈值"}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                缓存命中
              </span>
              <Badge variant={cacheHitRate > 0.5 ? "default" : "outline"}>
                {(cacheHitRate * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CostStatusBar({
  cost,
  threshold,
  onOpenDashboard,
}: {
  cost: number;
  threshold: number;
  onOpenDashboard?: () => void;
}) {
  const percentage = (cost / threshold) * 100;
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;

  return (
    <div className="flex items-center gap-2 text-xs">
      <DollarSign
        className={`h-3.5 w-3.5 ${
          isExceeded ? "text-red-500" : isWarning ? "text-yellow-500" : ""
        }`}
      />
      <span className={isExceeded ? "text-red-500" : ""}>
        ${cost.toFixed(4)}
      </span>
      {isWarning && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
      {onOpenDashboard && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-xs"
          onClick={onOpenDashboard}
        >
          详情
        </Button>
      )}
    </div>
  );
}
