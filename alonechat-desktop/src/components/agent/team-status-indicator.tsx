"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";

export interface TeamStatusIndicatorProps {
  teamId: string;
  phase: string;
  workerCount: number;
  completedTasks: number;
  totalTasks: number;
  hasErrors: boolean;
  isRunning: boolean;
  onOpenPanel?: () => void;
  showDetails?: boolean;
}

const phaseColors: Record<string, string> = {
  planning: "text-purple-500",
  dispatching: "text-blue-500",
  executing: "text-cyan-500",
  verifying: "text-yellow-500",
  aggregating: "text-indigo-500",
  done: "text-green-500",
  failed: "text-red-500",
};

const phaseLabels: Record<string, string> = {
  planning: "规划",
  dispatching: "调度",
  executing: "执行",
  verifying: "验证",
  aggregating: "聚合",
  done: "完成",
  failed: "失败",
};

export function TeamStatusIndicator({
  teamId,
  phase,
  workerCount,
  completedTasks,
  totalTasks,
  hasErrors,
  isRunning,
  onOpenPanel,
  showDetails = true,
}: TeamStatusIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const PhaseIcon =
    phase === "done"
      ? CheckCircle2
      : phase === "failed"
      ? XCircle
      : isRunning
      ? Loader2
      : Clock;

  const colorClass = phaseColors[phase] || "text-gray-500";

  if (!showDetails) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${colorClass}`}
        onClick={onOpenPanel}
      >
        <Users className="h-4 w-4" />
        <PhaseIcon className={`h-4 w-4 ml-1 ${isRunning ? "animate-spin" : ""}`} />
        {totalTasks > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {completedTasks}/{totalTasks}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`h-8 px-2 ${colorClass}`}>
          <Users className="h-4 w-4" />
          <PhaseIcon className={`h-4 w-4 ml-1 ${isRunning ? "animate-spin" : ""}`} />
          <span className="ml-1 text-sm">{workerCount}人</span>
          {hasErrors && <XCircle className="h-3 w-3 ml-1 text-red-500" />}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Team 状态</h4>
            {onOpenPanel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPanel();
                }}
              >
                打开面板
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <PhaseIcon className={`h-4 w-4 ${colorClass} ${isRunning ? "animate-spin" : ""}`} />
                阶段
              </span>
              <Badge variant="outline" className={colorClass}>
                {phaseLabels[phase] || phase}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>成员数</span>
              <Badge variant="secondary">{workerCount}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>任务进度</span>
              <Badge variant="secondary">
                {completedTasks}/{totalTasks}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>状态</span>
              <Badge variant={isRunning ? "default" : "outline"}>
                {isRunning ? "运行中" : "已停止"}
              </Badge>
            </div>

            {hasErrors && (
              <div className="flex items-center justify-between text-sm text-red-500">
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  错误
                </span>
                <span>有错误</span>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Team ID: {teamId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
